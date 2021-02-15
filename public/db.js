let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objStore = db.createObjectStore('pending', {autoIncrement: true});
}

request.onsuccess = (event) => {
  db = event.target.result;
  if(navigator.onLine === true) {
    checkDatabase();
  }
}

request.onerror = () => {
  console.log(request.error);
}

function saveRecord(data) {
  db = request.result;
  const transaction = db.transaction(["pending"], "readwrite");
  const objStore = transaction.objectStore('pending');
  objStore.add(data);
}

function checkDatabase() {
  db = request.result;
  const transaction = db.transaction(["pending"], "readwrite");
  const objectStore = transaction.objectStore("pending");
  const getAll = objectStore.getAll();
  
  getAll.onsuccess = () => {
    if(getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(getAll.result)
      })
      .then((response) => {
        response.json();
      })
      .then(()=> {
        db = request.result;
        const transaction = db.transaction(["pending"], "readwrite");
        const objStore = transaction.objectStore("pending");
        objStore.clear();
      });
  }
  }
}