import JournalItem from "./JournalItem";
import styles from "./JournalList.module.css";

const JournalList = (props) => {

  return (
      <ul className={styles.journalList}>
        {props.journalList.map(journal => (
          <JournalItem
            key={journal.id}
            journal={journal}
            itemClickHandler={props.itemClickHandler}
            selectedId={props.selectedId}
          />
        ))}
      </ul>
    );       
};

export default JournalList;
