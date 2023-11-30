const downloadBtn = document.getElementById("downloadReasult");
downloadBtn.addEventListener("click", createAndDownloadZip);

function createAndDownloadZip() {
  // Dummy data to be included in the zip file
  const files = [
    { name: "file1.txt", content: "Hello from file 1!" },
    { name: "file2.txt", content: "Greetings from file 2!" },
  ];

  // Store data in localStorage
  localStorage.setItem("zipData", JSON.stringify(files));

  // Retrieve data from localStorage
  const storedData = JSON.parse(localStorage.getItem("zipData"));

  // Create a new zip file
  const zip = new zip.fs.FS();

  // Add files to the zip
  for (const file of storedData) {
    zip.root.addFile(file.name, new zip.TextReader(file.content));
  }

  // Generate the zip file as a Blob
  zip.generateAsync({ type: "blob" }).then((zipBlob) => {
    // Create a temporary URL for the Blob
    const zipUrl = URL.createObjectURL(zipBlob);

    // Create an anchor element
    const a = document.createElement("a");

    // Set the href attribute to the temporary URL
    a.href = zipUrl;

    // Set the download attribute with the desired file name
    a.download = "example.zip";

    // Append the anchor element to the body
    document.body.appendChild(a);

    // Programmatically trigger a click event on the anchor element
    a.click();

    // Remove the anchor element from the body
    document.body.removeChild(a);

    // Revoke the temporary URL to free up resources
    URL.revokeObjectURL(zipUrl);
  });
}
