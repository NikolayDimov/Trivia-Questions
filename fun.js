const limit = 10;
api_url = "https://api.api-ninjas.com/v1/facts?limit={}".format(limit);
const headers = document
  .querySelector("fun-fatcs-p")
  .addEventListener("click", fetchData);

async function fetchData() {
  try {
    const newApiResponse = await fetch(api_url, headers);

    if (!newApiResponse.ok) {
      throw new Error(`HTTP error! Status: ${newApiResponse.status}`);
    }

    const funData = await newApiResponse.json();

    // Process and use the new data as needed
    // Update your HTML elements, etc.
  } catch (error) {
    console.error(error);
  }
}
