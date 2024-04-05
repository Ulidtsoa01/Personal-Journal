import React, {useState} from 'react';
import styles from "./JournalEdit.module.css";

const JournalEdit = (props) => {
  let j = props.journal;
  const [date, setDate] = useState(j!=null ? j.date.split('T')[0] : '');
  const [title, setTitle] = useState(j!=null ? j.name : '');
  const [journal, setJournal] = useState(j!=null ? j.value : '');

  const dateBlurHandler = (e) => {
    console.log("new date is " + e.target.value);
    if (date !== j.date.split('T')[0]) {
      j.date = date;
      props.commit(j);
    }
  }

  const titleBlurHandler = (e) => {
    //console.log("new title is " + e.target.value);
    if (title !== j.name) {
      j.name = title;
      props.commit(j);
    }
  }

  const journalBlurHandler = (e) => {
    //console.log("new journal is " + e.target.value);
    if (journal !== j.value) {
      j.value = journal;
      props.commit(j);
    }
  }

  //console.log("JournalEdit runs again. title=" + title + ", and journal title=" + (j!=null ? j.title : ''));

  return (
    <form className={styles.form}>
      <div className={styles.formControl}>
        <label>Id</label>
        <input type="text" readOnly={true} value={j==null ? '' : j.id}/>
      </div>
      <div className={styles.formControl}>
        <label>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} onBlur={dateBlurHandler}/>
      </div>
      <div className={styles.formControl}>
        <label>Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} onBlur={titleBlurHandler}/>
      </div>
      <div className={styles.formControl}>
        <textarea rows={30} cols={60} value={journal} onChange={e => setJournal(e.target.value)} onBlur={journalBlurHandler}/>
      </div>
    </form>
  );
};

export default JournalEdit;
