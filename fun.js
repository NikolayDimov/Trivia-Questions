const limit = 30;
const api_url = `https://api.api-ninjas.com/v1/facts?limit=${limit}`;
const headers = {
  headers: {
    "X-Api-Key": "JcZkU96W5n5XuzVc/0wq3w==T6O35MaJ40uGLAFU",
    "Content-Type": "application/json",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  fetchFunData();
});

async function fetchFunData() {
  try {
    const newApiResponse = await fetch(api_url, headers);

    if (!newApiResponse.ok) {
      throw new Error(`HTTP error! Status: ${newApiResponse.status}`);
    }

    const funData = await newApiResponse.json();

    // console.log(funData);
    return funData;
  } catch (error) {
    console.error(error);
  }
}

function getRandomFunFact(funData) {
  const randomIndex = Math.floor(Math.random() * funData.length);
  return funData[randomIndex].fact;
}

export { fetchFunData, getRandomFunFact };
