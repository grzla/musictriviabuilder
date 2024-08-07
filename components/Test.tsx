import React from "react";
import Button from "@mui/material/Button";
import { songList } from "../lib/utils";
import DraggableList from "../components/DraggableList";
import DraggableListItem from "../components/DraggableListItem";
import { DropResult } from "react-beautiful-dnd";
import { getItems, reorder } from "../helpers";
import { Item } from "@/types";

import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import pick from "@cahil/utils/accessors/pick";
// import makeStyles from "@material-ui/core/styles/makeStyles";
// import Paper from "@material-ui/core/Paper";

// import "./styles.css";

// map songList to DraggableList
const Test = () => {
  const [items, setItems] = React.useState(getItems(10));

  const onDragEnd = ({ destination, source }: DropResult) => {
    // dropped outside the list
    if (!destination) return;

    const newItems = reorder(items, source.index, destination.index);

    setItems(newItems);
  };

  return (
    <>
      <div>Test</div>
      <div>
        <DraggableList items={items} onDragEnd={onDragEnd} />
        <pre>
          {JSON.stringify(
            items.map((item) => pick(item, "id", "primary")),
            null,
            2
          )}
        </pre>
      </div>
      <Button variant="contained">Hello World</Button>
    </>
  );
};

export default Test;

// const useStyles = makeStyles({
//   flexPaper: {
//     flex: 1,
//     margin: 16,
//     minWidth: 350,
//   },
//   root: {
//     display: "flex",
//     flexWrap: "wrap",
//   },
// });
