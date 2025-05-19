function uploadImage() {
    document.getElementById("imageUpload").click();
}

document.getElementById("productForm").addEventListener("submit", function(event) {
    event.preventDefault();
    alert("Product Created Successfully!");
});
