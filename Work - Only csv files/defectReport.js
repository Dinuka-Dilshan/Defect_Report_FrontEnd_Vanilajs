const file = document.getElementById("fileUploadInput");
const clearFilebtn = document.getElementById("clearFile");
const uploadFileBtn = document.getElementById("uploadFile");
const tableData = document.getElementById("table-data");
const backDrop = document.getElementById("backdrop");
const spinner = document.getElementById("spinner");
const btnSave = document.getElementById("btnSave");
const messageOpenBtn = document.getElementById("messageOpenBtn");
const messageText = document.getElementById("messageText");
const messageTitle = document.getElementById("messageTitle");
const printDiv = document.getElementById("printDiv");
const btnDownload = document.getElementById("btnDownload");

//states
const loadingState = new State(false, "loadingState");
const dataState = new State(null, "dataState");
const savedState = new State(null, "savedState");
const errorState = new State(false, "errorState");

clearFilebtn.addEventListener("click", () => {
  file.value = "";
});

uploadFileBtn.addEventListener("click", () => {
  if (file.files.length > 0) {
    loadingState.setState(true);
    const formData = new FormData();
    formData.append("csv_file", file.files[0]);

    fetch(
      "http://ec2-54-169-87-142.ap-southeast-1.compute.amazonaws.com:1118/defect_level",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        if (result.error) {
          throw new Error("Failed");
        }
        loadingState.setState(false);
        dataState.setState(result);
      })
      .catch(() => {
        errorState.setState(true);
        loadingState.setState(false);
      });
  } else {
    messageText.innerText = "Please select a file !";
    messageTitle.innerText = "Upload Test Cases";
    messageOpenBtn.click();
  }
});

btnSave.addEventListener("click", () => {
  if (file.files.length > 0) {
    loadingState.setState(true);

    const formData = new FormData();
    formData.append("csv_file", file.files[0]);

    fetch(
      "http://ec2-54-169-87-142.ap-southeast-1.compute.amazonaws.com:1118/save2db",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        if (result.status === "succesfully updated data") {
          loadingState.setState(false);
          savedState.setState(true);
        } else {
          throw new Error("Save Failed");
        }
      })
      .catch(() => {
        loadingState.setState(false);
        errorState.setState(true);
      });
  } else {
    messageText.innerText = "Please select a file !";
    messageOpenBtn.click();
  }
});

btnDownload.addEventListener("click", () => {
  html2pdf().from(printDiv).toPdf().save("results.pdf");
});

loadingState.subscribe((state) => {
  if (state) {
    backDrop.classList.add("backdrop");
    spinner.classList.add("lds-facebook");
  } else {
    backDrop.classList.remove("backdrop");
    spinner.classList.remove("lds-facebook");
  }
});

dataState.subscribe((data) => {
  Array.isArray(data) &&
    data.map(
      (predicate) =>
        (tableData.innerHTML =
          tableData.innerHTML +
          `<tr class="text-start fw-bold"><td>${
            predicate.DefectReport
          }</td> <td ${
            predicate.PriorityLevel === "P1" && 'class="text-danger"'
          }  ${predicate.PriorityLevel === "P2" && 'class="text-warning"'} ${
            predicate.PriorityLevel === "P3" && 'class="text-pink"'
          } ${predicate.PriorityLevel === "P4" && 'class="text-primary"'} ${
            predicate.PriorityLevel === "P5" && 'class="text-success"'
          } >${predicate.PriorityLevel}</td></tr>`)
    );
});

savedState.subscribe((state) => {
  if (state) {
    messageTitle.innerText = "Save Test Cases";
    messageText.innerText = "Saved Sucessfully";
  } else {
    messageTitle.innerText = "Save Test Cases";
    messageText.innerText = "Failed To Save. Try Again !";
  }
  messageOpenBtn.click();
});

errorState.subscribe((eror) => {
  if (eror) {
    messageText.innerText = "Error Ocuured! Try again!";
    messageTitle.innerText = "Error";
    messageOpenBtn.click();
  }
});
