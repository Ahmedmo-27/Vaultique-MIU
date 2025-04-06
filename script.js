let selectedStyle = '';
let selectedColor = '';
let selectedBudget = '';
let selectedMaterial = '';

function nextQuestion() {
  
  selectedStyle = document.getElementById('watchStyle').value;
  selectedColor = document.getElementById('watchColor').value;
  selectedBudget = document.getElementById('budget').value;
  selectedMaterial = document.getElementById('material').value;

  
  if (selectedStyle && document.getElementById('question-2').style.display === "none") {
    document.getElementById('question-2').style.display = "block";
  }
  if (selectedColor && document.getElementById('question-3').style.display === "none") {
    document.getElementById('question-3').style.display = "block";
  }
  if (selectedBudget && document.getElementById('question-4').style.display === "none") {
    document.getElementById('question-4').style.display = "block";
  }

  
  if (selectedStyle && selectedColor && selectedBudget && selectedMaterial) {
    showRecommendations();
  }
}

function showRecommendations() {
  // Hide questionnaire and show recommendations
  document.querySelector('.questionnaire').style.display = "none";
  document.getElementById('recommendations').style.display = "block";

  
  const allWatches = [
    { id: 1, name: 'Sporty Watch', style: 'Sport', color: 'Black', material: 'Metal', price: 40, image: 'https://via.placeholder.com/200?text=Sport+Watch' },
    { id: 2, name: 'Classic Gold Watch', style: 'Classic', color: 'Gold', material: 'Leather', price: 150, image: 'https://via.placeholder.com/200?text=Gold+Watch' },
    { id: 3, name: 'Luxury Silver Watch', style: 'Luxury', color: 'Silver', material: 'Metal', price: 250, image: 'https://via.placeholder.com/200?text=Silver+Watch' },
    { id: 4, name: 'Fashion Watch', style: 'Fashion', color: 'Blue', material: 'Silicone', price: 80, image: 'https://via.placeholder.com/200?text=Fashion+Watch' }
  ];

  // Filter the watches based on user selections
  const filteredWatches = allWatches.filter(watch => 
    (watch.style === selectedStyle) &&
    (watch.color === selectedColor || selectedColor === '') &&
    (budgetFilter(watch.price)) &&
    (watch.material === selectedMaterial || selectedMaterial === '')
  );

  // Display the filtered watches
  const watchListDiv = document.getElementById('watch-list');
  watchListDiv.innerHTML = '';

  if (filteredWatches.length > 0) {
    filteredWatches.forEach(watch => {
      const watchCard = document.createElement('div');
      watchCard.classList.add('recommendation-card');
      watchCard.innerHTML = `
        <img src="${watch.image}" alt="${watch.name}">
        <h3>${watch.name}</h3>
        <p>Price: $${watch.price}</p>
        <button>Add to Cart</button>
      `;
      watchListDiv.appendChild(watchCard);
    });
  } else {
    watchListDiv.innerHTML = `<p>No watches found based on your preferences.</p>`;
  }
}

function budgetFilter(price) {
  if (selectedBudget === 'Under50' && price <= 50) return true;
  if (selectedBudget === '50to100' && price > 50 && price <= 100) return true;
  if (selectedBudget === '100to200' && price > 100 && price <= 200) return true;
  if (selectedBudget === 'Over200' && price > 200) return true;
  return false;
}
