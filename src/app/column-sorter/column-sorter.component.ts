import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  EventEmitter,
  Output,
  ViewEncapsulation,
  ElementRef,
  ChangeDetectionStrategy
} from "@angular/core";
import { moveItemInArray, CdkDragDrop, CdkDrag } from "@angular/cdk/drag-drop";
import { ColumnInfo } from "../column-sorter.service";

@Component({
  selector: "va-mat-table-column-sorter, button[va-mat-table-column-sorter]",
  templateUrl: "./column-sorter.component.html",
  styleUrls: ["./column-sorter.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnSorterComponent implements OnInit, AfterViewInit {
  @Output()
  columnsChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Input()
  columns: string[];
  @Input()
  columnNames: string[];
  @Input()
  saveName?: string;

  public columnInfo: ColumnInfo[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.columnInfo = this.columns.map((currElement, index) => {
      return {
        id: currElement,
        name: this.columnNames[index],
        hidden: false,
        pinned: false,
        width: 0
      };
    });
    // this.columnInfo = this.columnSorterService.loadSavedColumnInfo(this.columnInfo, this.saveName);
    this.emitColumns();
  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.classList += "va-mat-button-no-input";
  }

  columnMenuDropped(event: CdkDragDrop<any>): void {
    moveItemInArray(
      this.columnInfo,
      event.item.data.columnIndex,
      event.currentIndex
    );
    this.emitColumns();
  }

  toggleSelectedColumn(columnId: string) {
    const colFound = this.columnInfo.find(col => col.id === columnId);
    colFound.hidden = !colFound.hidden;
    this.emitColumns();
  }

  public fnPinColumn(colName: string, pinned: boolean): void {
    const colFound = this.columnInfo.find(col => col.id === colName);
    if (pinned) {
      moveItemInArray(this.columnInfo, this.columnInfo.indexOf(colFound), 0);
    } else {
      let index = this.columnInfo.findIndex(col => col.pinned === false);
      if (index === -1) index = this.columnInfo.length;
      moveItemInArray(
        this.columnInfo,
        this.columnInfo.indexOf(colFound),
        index - 1
      );
    }
    colFound.pinned = pinned;

    this.emitColumns();
  }

  sortPredicate = ((index: number, item: CdkDrag<number>) => {
    if (!!this.columnInfo && this.columnInfo[index].pinned === true)
      return false;
    return true;
  }).bind(this);

  private emitColumns() {
    // Only emit the columns on the next animation frame available
    window.requestAnimationFrame(() => {
      this.columnsChange.emit(
        this.columnInfo
          .filter(colInfo => !colInfo.hidden)
          .map(colInfo => colInfo.id)
      );
    });
  }
}
