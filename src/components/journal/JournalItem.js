import styles from "./JournalItem.module.css";

const JournalItem = (props) => {
  const date = props.journal.date.split("T")[0];
  const itemText = date + " " + props.journal.name;
  return (
    <li
      className={
        props.journal.id === props.selectedId
          ? styles.journalItemSelected
          : styles.journalItem
      }
      id={props.journal.id}
      onClick={props.itemClickHandler}
    >
      {itemText}
    </li>
  );
};

export default JournalItem;
