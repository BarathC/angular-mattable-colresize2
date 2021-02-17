import { Directive, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTableResize]'
})
export class TableResizeDirective {
  @Input("resizeColumn") resizable: boolean;
  @Input() index: number;
  @Input() column: HTMLElement;
  @Input() table: HTMLElement;

  constructor(private renderer: Renderer2) { }
  ngOnInit() {
    if (this.resizable) {
    }
  }
}