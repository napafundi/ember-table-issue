import Controller from "@ember/controller";
import { action } from "@ember/object";

export default class IndexController extends Controller {
  displayAltColumns = false;

  columns = [
    {
      valuePath: "date",
      name: "Date",
      isFixedLeft: true,
      width: 200,
      staticWidth: 200
    }
  ];

  columnsAlt = [
    {
      valuePath: "name",
      name: "Name",
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

  @action
  changeDisplay() {
    this.toggleProperty("displayAltColumns");
  }
}
