import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild
} from "@angular/core";
import { MatTable } from "@angular/material/table";
import { ColumnSorterComponent } from "./column-sorter/column-sorter.component";

export interface PeriodicElement {
  Name: string;
  Position: number;
  Weight: number;
  Symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { Position: 1, Name: "Hydrogen", Weight: 1.0079, Symbol: "H" },
  { Position: 2, Name: "Helium", Weight: 4.0026, Symbol: "He" },
  { Position: 3, Name: "Lithium", Weight: 6.941, Symbol: "Li" },
  { Position: 4, Name: "Beryllium", Weight: 9.0122, Symbol: "Be" },
  { Position: 5, Name: "Boron", Weight: 10.811, Symbol: "B" },
  { Position: 6, Name: "Carbon", Weight: 12.0107, Symbol: "C" },
  { Position: 7, Name: "Nitrogen", Weight: 14.0067, Symbol: "N" },
  { Position: 8, Name: "Oxygen", Weight: 15.9994, Symbol: "O" },
  { Position: 9, Name: "Fluorine", Weight: 18.9984, Symbol: "F" },
  { Position: 10, Name: "Neon", Weight: 20.1797, Symbol: "Ne" }
];

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, AfterViewInit {
  title = "Material Table column Resize";
  @ViewChild(MatTable, { read: ElementRef }) private matTableRef: ElementRef;

  columns: any[] = [];
  @ViewChild(ColumnSorterComponent) child:ColumnSorterComponent;
  tableColumns: any[] = [
    { field: "Position", width: 100, pinned:false },
    { field: "Name", width: 370, pinned: false },
    { field: "Weight", width: 270, pinned: false },
    { field: "Symbol", width: 100, pinned: false }
  ];
  displayedColumns: string[] = [];
  displayedColumnsNames: string[] = ["No.", "Name", "Weight", "Symbol"];
  dataSource = ELEMENT_DATA;

  pressed = false;
  currentResizeIndex: number;
  startX: number;
  startWidth: number;
  isResizingRight: boolean;
  resizableMousemove: () => void;
  resizableMouseup: () => void;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.columns = this.tableColumns;
    this.setDisplayedColumns();
  }

  ngAfterViewInit() {
    this.setTableResize(this.matTableRef.nativeElement.clientWidth);
  }

  public fnPinColumn(colName: any): void {
    colName.pinned = !colName.pinned;
    this.child.fnPinColumn(colName.field, colName.pinned);

  }

  setTableResize(tableWidth: number) {
    let totWidth = 0;
    this.columns.forEach(column => {
      totWidth += column.width;
    });
    let scale = (tableWidth - 5) / totWidth;
    this.columns.forEach(column => {
      column.width *= scale;
      if (column.width < 100) {
        column.width = 100;
        totWidth = totWidth - 100;
        tableWidth = tableWidth - 100;
        scale = (tableWidth - 5) / totWidth;
      } else {
        totWidth = totWidth - column.width;
        tableWidth = tableWidth - column.width / scale;
      }
      this.setColumnWidth(column);
    });
  }

  setDisplayedColumns() {
    this.columns.forEach((column, index) => {
      column.index = index;
      this.displayedColumns[index] = column.field;
    });
  }

  public columnsReordered(columns: string[]): void {
    this.displayedColumns = columns;
    const columnName: string[] = this.displayedColumns.filter(
      item => !this.columns.find(a => a.field === item)
    );
    if (!!columnName && columnName.length > 0) {
      const columnadded = this.tableColumns.find(
        item => item.field === columnName[0]
      );
      this.columns.push(columnadded);
    }
    this.columns = this.columns.filter(item =>
      this.displayedColumns.includes(item.field)
    );
    this.columns.sort((item1, item2) => {
      return (
        this.displayedColumns.indexOf(item1.field) -
        this.displayedColumns.indexOf(item2.field)
      );
    });
    setTimeout(() => {
      this.setTableResize(this.matTableRef.nativeElement.clientWidth);
    }, 0);
  }

  onResizeColumn(event: any, headercell: any, index: number) {
    this.checkResizing(event, index);
    this.currentResizeIndex = index;
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = headercell.clientWidth;
    event.preventDefault();
    this.mouseMove(index);
  }

  private checkResizing(event, index) {
    const cellData = this.getCellData(index);
    if (
      index === 0 ||
      (Math.abs(event.pageX - cellData.right) < cellData.width / 2 &&
        index !== this.columns.length - 1)
    ) {
      this.isResizingRight = true;
    } else {
      this.isResizingRight = false;
    }
  }

  private getCellData(index: number) {
    const headerRow = this.matTableRef.nativeElement.children[0];
    const cell = headerRow.children[index];
    return cell.getBoundingClientRect();
  }

  mouseMove(index: number) {
    this.resizableMousemove = this.renderer.listen(
      "document",
      "mousemove",
      event => {
        if (this.pressed && event.buttons) {
          const dx = this.isResizingRight
            ? event.pageX - this.startX
            : -event.pageX + this.startX;
          const width = this.startWidth + dx;
          if (this.currentResizeIndex === index && width > 100) {
            this.setColumnWidthChanges(index, width);
          }
        }
      }
    );
    this.resizableMouseup = this.renderer.listen(
      "document",
      "mouseup",
      event => {
        if (this.pressed) {
          this.pressed = false;
          this.currentResizeIndex = -1;
          this.resizableMousemove();
          this.resizableMouseup();
        }
      }
    );
  }

  setColumnWidthChanges(index: number, width: number) {
    const orgWidth = this.columns[index].width;
    const dx = width - orgWidth;
    if (dx !== 0) {
      const j = this.isResizingRight ? index + 1 : index - 1;
      const newWidth = this.columns[j].width - dx;
      if (newWidth > 100) {
        this.columns[index].width = width;
        this.setColumnWidth(this.columns[index]);
        this.columns[j].width = newWidth;
        this.setColumnWidth(this.columns[j]);
      }
    }
  }

  setColumnWidth(column: any) {
    const columnEls = Array.from(
      document.getElementsByClassName("mat-column-" + column.field)
    );
    columnEls.forEach((el: HTMLDivElement) => {
      el.style.width = column.width + "px";
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.setTableResize(this.matTableRef.nativeElement.clientWidth);
  }
}
