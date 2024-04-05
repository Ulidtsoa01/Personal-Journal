import React, { useState, useEffect } from 'react';
import JournalList from "./JournalList";
import JournalEdit from "./JournalEdit";
import DeleteConfirmation from '../UI/DeleteConfirmation';
import styles from "./JournalApp.module.css"
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';
import { useFilePicker } from 'use-file-picker';
/*
const journalData = {
  "1" : {id: 1, date: "2023-12-10T00:05:41.047Z", name: "test 1", value: "journal 1"},
  "2" : {id: 2, date: "2023-12-11T00:05:41.047Z", name: "test 2", value: "journal 2"},
  "3" : {id: 3, date: "2023-12-12T00:05:41.047Z", name: "test 3", value: "journal 3"},
  "4" : {id: 4, date: "2023-12-15T00:05:41.047Z", name: "test 4", value: "journal 4"},
  "5" : {id: 5, date: "2023-12-18T00:05:41.047Z", name: "test 5", value: "journal 5"}
};
*/

const DB_VERSION = 1;
const DB_NAME = 'JournalDB';
/*
const loadJournalData = () => {
  const data = {};
  const ids = localStorage.getItem("ids");
  //console.log("loadJournalData called");
  //console.log("ids: " + JSON.stringify(ids));
  if (ids != null && ids.length > 0) {
    const idArray = ids.split(",");
    for (const id of idArray) {
      const json = localStorage.getItem(id);
      //console.log(id + ": " + json);
      if (json != null && json.length > 0) {
        const obj = JSON.parse(json);
        data[+id] = obj;
      }
    }
  }
  //console.log("data: " + JSON.stringify(data));
  return data;
};
*/
const journalData = {}; //loadJournalData();

const JournalApp = (props) => {
  const [journalList, setJournalList] = useState([]);
  /*
  const [journalList, setJournalList] = useState(Object.values(journalData).sort((a, b) => {
    return (b.id - a.id);
  }));
  */
  const [selectedId, setSelectedId] = useState((journalList != null && journalList.length > 0) ? journalList[0].id : -1);
  const [displayConfirmationModal, setDisplayConfirmationModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("danger");

  const hideAlert = () => {
    setShowAlert(false);
  };

  const showAlertMessage = (variant, message) => {
    setShowAlert(true);
    setAlertVariant(variant);
    setAlertMessage(message);
  };

  useEffect(() => {
    const dbOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

    dbOpenRequest.onerror = (event) => {
      showAlertMessage('danger', 'Error opening database request.');
    };
  
    dbOpenRequest.onsuccess = (event) => {
      console.log('Database initialised.');
  
      // Store the result of opening the database in the db variable. This is used a lot below
      let db = dbOpenRequest.result;
  
      const objectStore = db.transaction(["journals"]).objectStore("journals");
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          journalData[cursor.value.id] = cursor.value;
          cursor.continue();
        } else {
          setJournalList(Object.values(journalData).sort((a, b) => {
            return (b.id - a.id);
          }));
          console.log(`load from database complete.`);
        }
      };      
    };

    dbOpenRequest.onupgradeneeded = (event) => {
      console.log('onupgradeneeded called.');
      let db = event.target.result;
  
      db.onerror = (event) => {
        showAlertMessage('danger', 'Error loading database.');
      };
  
      // Create an objectStore for this database
      const objectStore = db.createObjectStore('journals', { keyPath: 'id' });
  
      // Define what data items the objectStore will contain
      objectStore.createIndex('date', 'date', { unique: false });
  
      console.log('Object store created.');
    };
  }, []); // will only run once

  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.json',
    multiple: false,
    onFilesSelected: ({ plainFiles, filesContent, errors }) => {
      // this callback is always called, even if there are errors
      //console.log('onFilesSelected', plainFiles, filesContent, errors);
    },
    onFilesRejected: ({ errors }) => {
      // this callback is called when there were validation errors
      console.log('onFilesRejected', errors);
      showAlertMessage("danger", "Import failed. " + errors);
    },
    onFilesSuccessfullySelected: ({ plainFiles, filesContent }) => {
      // this callback is called when there were no validation errors
      console.log('onFilesSuccessfullySelected', plainFiles);
      filesContent.map((file, index) => {
        importHandler(file.content);
      })
    },
    onClear: () => {
      // this callback is called when the selection is cleared
      console.log('onClear');
    },
  });

  const selectHandler = (event) => {
    setSelectedId(event.target.id);
    //console.log(event.target.id + " selected");
  };

  const commitChange = (j) => {
    // save j to local storage
    //localStorage.setItem(j.id.toString(), JSON.stringify(j));
    const dbOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

    dbOpenRequest.onerror = (event) => {
      showAlertMessage('danger', 'Error opening database request.');
    };
  
    dbOpenRequest.onsuccess = (event) => {
      // Store the result of opening the database in the db variable. This is used a lot below
      let db = dbOpenRequest.result;
  
      const objectStore = db.transaction(["journals"], "readwrite").objectStore("journals");
      const requestUpdate = objectStore.put(j);
      requestUpdate.onerror = (event) => {
        showAlertMessage('danger', 'Error updating database.');
      };
      requestUpdate.onsuccess = (event) => {
        console.log("Journal successfully updated in database.");
      };                
    };
  };

  const deleteHandler = () => {
    if (selectedId < 0)
      return;
    setDisplayConfirmationModal(true);
  };

  const submitDelete = (idStr) => {
    let id = +idStr;
    if (id < 0)
      return;
    const index = journalList.indexOf(journalData[id]) - 1;
    const newList = journalList.filter(j => j.id != id);
    delete journalData[id];
    //const keys = Object.keys(journalData);
    //localStorage.removeItem(id.toString());
    //localStorage.setItem("ids", keys.join(","));
    setJournalList(newList);
    setSelectedId(index >= 0 && index < journalList.length ? journalList[index].id : -1);
    setDisplayConfirmationModal(false);

    const dbOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

    dbOpenRequest.onerror = (event) => {
      showAlertMessage('danger', 'Error opening database request.');
    };
  
    dbOpenRequest.onsuccess = (event) => {
      // Store the result of opening the database in the db variable. This is used a lot below
      let db = dbOpenRequest.result;
  
      const objectStore = db.transaction(["journals"], "readwrite").objectStore("journals");
      const requestDelete = objectStore.delete(id);
      requestDelete.onerror = (event) => {
        showAlertMessage('danger', 'Error deleting a journal in datrabase.');
      };
      requestDelete.onsuccess = (event) => {
        console.log("Journal successfully deleted in database.");
      };                
    };
  };

  // Hide the modal
  const hideConfirmationModal = () => {
    setDisplayConfirmationModal(false);
  };

  const importHandler = (fileContent) => {
    //console.log("importHandler called");
    const obj = JSON.parse(fileContent);
    const trendFormat = "journals" in obj;
    const values =  trendFormat ? obj["journals"].reverse() : Object.values(obj);
    if (trendFormat) {
      for (let i=0; i<values.length; i++) {
        values[i].id = i+1;
      }
    }
    const journalCount = values.length;
    //const keys = Object.keys(journalData);
    //const ids = keys.join(",");
    //localStorage.setItem("ids", ids);
    const dbOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

    dbOpenRequest.onerror = (event) => {
      showAlertMessage('danger', 'Error opening database request.');
    };
  
    dbOpenRequest.onsuccess = (event) => {
      // Store the result of opening the database in the db variable. This is used a lot below
      let db = dbOpenRequest.result;
  
      const objectStore = db.transaction(["journals"], "readwrite").objectStore("journals");
      let insertCount = 0;
      const onError = (event) => {
        showAlertMessage('danger', 'Error inserting into database.');        
      };
      const onSuccess = (event) => {
        insertCount++;
        if (insertCount === journalCount) {
          //console.log("Import complete.");
          showAlertMessage("success", journalCount + " journals imported successfully.");
        }
      };                
      values.map((j) => {
        if (!(j.id in journalData)) {
          journalList.unshift(j);
          let requestAdd = objectStore.add(j);
          requestAdd.onerror = onError;
          requestAdd.onsuccess = onSuccess;                
        }
        journalData[j.id] = j;
        //localStorage.setItem(j.id.toString(), JSON.stringify(j));
      });
      setJournalList(journalList);
    };
  };

  const addHandler = () => {
    //console.log("addHanlder called");
    const newDate = new Date();
    const newDateString = newDate.toISOString();
    //console.log("new date is " + newDateString);
    const newId = journalList == null || journalList.length == 0 ? 1 : journalList[0].id + 1;
    const j = {
      id: newId,
      date: newDateString,
      name: '',
      value: ''
    };
    journalList.unshift(j);
    journalData[j.id] = j;
    setJournalList(journalList);
    //const keys = Object.keys(journalData);
    //console.log(JSON.stringify(journalData));
    //console.log("keys: " + keys);
    setSelectedId(j.id);
    //const ids = keys.join(",");
    //console.log("ids: " + ids);
    //localStorage.setItem("ids", ids);
    //localStorage.setItem(j.id.toString(), JSON.stringify(j));
    const dbOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

    dbOpenRequest.onerror = (event) => {
      showAlertMessage('danger', 'Error opening database request.');
    };
  
    dbOpenRequest.onsuccess = (event) => {
      // Store the result of opening the database in the db variable. This is used a lot below
      let db = dbOpenRequest.result;
  
      const objectStore = db.transaction(["journals"], "readwrite").objectStore("journals");
      const requestAdd = objectStore.add(j);
      requestAdd.onerror = (event) => {
        showAlertMessage('danger', 'Error inserting into database.');
      };
      requestAdd.onsuccess = (event) => {
        console.log("Journal successfully inserted in database.");
      };                
    };
  }

  const exportHandler = () => {
    //console.log("exportHandler called");
    const FileSaver = require("file-saver");
    // Save Blob file
    const blob = new Blob([JSON.stringify(journalData, null, 2)], {
      type: "application/json",
    });
    FileSaver.saveAs(blob, "myJournal.json");
  };

  return (
    <div>
      <div className={styles.topPanel}>
        <Button className={styles.button} onClick={addHandler}>Add</Button>
        <Button className={styles.button} onClick={deleteHandler}>Delete</Button>
        <Button className={styles.button} onClick={() => openFilePicker()}>Import</Button>
        <Button className={styles.button} onClick={exportHandler}>Export</Button>
      </div>
      {showAlert && <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>{alertMessage}</Alert>}
      <div className={styles.midPanel}>
        <JournalList className={styles.journalApp} journalList={journalList} selectedId={selectedId} itemClickHandler={selectHandler} />
        {/* The key attribute below is critical. Without it, the component will not refresh when selection changes. */}
        <JournalEdit key={selectedId} journal={journalData[selectedId]} commit={commitChange} />
      </div>
      <DeleteConfirmation showModal={displayConfirmationModal} confirmModal={submitDelete} hideModal={hideConfirmationModal} id={selectedId} message="Are you sure you want to delete this journal?" />
    </div>
  );
};

export default JournalApp;
