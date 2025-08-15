fetch("../questions/baby-shower.json")
  .then((res) => res.json())
  .then((data) => {
    const categoryNames = data.mainCategories.map((cat) => cat.name).join(", ");
    console.log(categoryNames);
  })
  .catch((err) => console.error("JSON fetch error:", err));
