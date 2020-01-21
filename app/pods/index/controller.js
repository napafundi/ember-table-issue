import Controller from "@ember/controller";
import { A } from "@ember/array";
import { computed, action, set, setProperties, get } from "@ember/object";
import { isEmpty } from "@ember/utils";
import { gte, conditional } from "ember-awesome-macros";

export default class IndexController extends Controller {
  visibleColumns = [];
  columnPanPosition = 0;
  containerWidth = 400;

  columns = [
    {
      valuePath: "date",
      name: "Date",
      isFixedLeft: true,
      width: 200,
      staticWidth: 200
    },
    {
      valuePath: "name",
      name: "Name",
      isFixedLeft: false,
      width: 200,
      staticWidth: 200
    },
    {
      valuePath: "age",
      name: "Age",
      isFixedLeft: false,
      width: 200,
      staticWidth: 200
    },
    {
      valuePath: "tall",
      name: "Tall",
      isFixedLeft: false,
      width: 200,
      staticWidth: 200
    },
    {
      valuePath: "short",
      name: "Short",
      isFixedLeft: false,
      width: 200,
      staticWidth: 200
    }
  ];

  rows = [
    {
      date: "1/1/2020",
      name: "Frodo Baggins",
      age: 150,
      tall: false,
      short: true
    },
    {
      date: "1/1/2021",
      name: "Gandalf the Grey",
      age: 145,
      tall: true,
      short: false
    }
  ];

  @gte("containerWidth", "minFixedColTableWidth") allowFixedCols;
  @conditional(
    "allowFixedCols",
    "firstVisibleNonFixedColumn",
    "visibleColumns.firstObject"
  )
  firstVisibleColumn;

  @computed("fixedColumns.@each.width", "nonFixedColumns.@each.width")
  get minFixedColTableWidth() {
    //fixed columns are disabled if the widest non-fixed column cannot
    //fit in the container at the same time as the fixed column(s)
    if (!isEmpty(this.fixedColumns)) {
      const sortedColumns = get(this, "nonFixedColumns").sortBy("staticWidth");
      const widestColumn = get(sortedColumns, "lastObject");
      const widestColumnWidth = widestColumn ? widestColumn.staticWidth : 0;
      const fixedWidth = this.fixedColumns.reduce(
        (prev, col) => prev + col.staticWidth,
        0
      );
      return widestColumnWidth + fixedWidth;
    } else {
      return 0;
    }
  }

  @computed("visibleColumns.@each.isFixedLeft")
  get firstVisibleNonFixedColumn() {
    return (
      this.visibleColumns && this.visibleColumns.find(col => !col.isFixedLeft)
    );
  }

  @computed("columns.@each.isFixedLeft")
  get fixedColumns() {
    return (this.columns || A()).filter(col => col.isFixedLeft);
  }

  @computed("columns.@each.isFixedLeft")
  get nonFixedColumns() {
    return (this.columns || A()).filter(col => !col.isFixedLeft);
  }

  init() {
    super.init(...arguments);
    this.updateColumnVisibility();
  }

  /**
   * Hides and shows table columns depending on the available container width
   */
  updateColumnVisibility() {
    const columns = this.columns || [];
    const visibleColumns = [];
    const containerWidth = this.containerWidth;
    const allowFixedCols = this.allowFixedCols;
    const panPosition = this.columnPanPosition;
    let newTableWidth = 0;

    for (const [i, col] of columns.entries()) {
      let colIndex = allowFixedCols ? this.nonFixedColumns.indexOf(col) : i;
      if (
        (col && col.isFixedLeft && allowFixedCols) ||
        colIndex >= panPosition
      ) {
        let colWidth = col.staticWidth || 0;
        let isVisible =
          (col.isFixedLeft && allowFixedCols) ||
          newTableWidth + colWidth <= containerWidth;
        if (isVisible) {
          newTableWidth += colWidth;
          visibleColumns.pushObject(col);
        } else {
          break;
        }
      }
    }

    setProperties(this, { containerWidth, visibleColumns });
  }

  /**
   * Returns the computed width for the given element
   */
  getElementWidth(el) {
    let width = 0;

    if (el) {
      let rects = el.getClientRects();
      let paddingLeft = parseFloat(
        window.getComputedStyle(el, null).getPropertyValue("padding-left")
      );
      let paddingRight = parseFloat(
        window.getComputedStyle(el, null).getPropertyValue("padding-right")
      );
      if (rects) {
        width =
          paddingLeft && paddingRight
            ? rects[0].width - (paddingLeft + paddingRight)
            : rects[0].width;
      }
    }

    return width;
  }

  /**
   * Pans the table's visible column to the left or right the provided number of columns
   * e.g. `-1` pans one column to the left, `2` pans two columns to the right
   */
  panColumns(moveIndex) {
    const newColumnPanPosition = this.columnPanPosition + moveIndex;
    const pannedColumns = this.allowFixedCols
      ? this.nonFixedColumns
      : this.columns;
    if (
      newColumnPanPosition < 0 ||
      newColumnPanPosition >= pannedColumns.length
    ) {
      return;
    }

    set(this, "columnPanPosition", newColumnPanPosition);
    this.updateColumnVisibility();
  }

  /**
   * Pans the table's visible columns to the right
   */
  @action
  panColumnsRight() {
    return this.panColumns(1);
  }

  /**
   * Pans the table's visible columns to the left
   */
  @action
  panColumnsLeft() {
    return this.panColumns(-1);
  }
}
