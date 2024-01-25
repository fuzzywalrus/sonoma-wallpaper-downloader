const createLinksList = (jsonData) => {
    const assets = jsonData.assets;
    const linksContainer = document.getElementById('links');

    // Clear existing content
    linksContainer.innerHTML = '';

    assets.forEach(asset => {
        console.log(asset);

        // Use label from references if available, otherwise fall back to accessibilityLabel
        const label = asset.newLabel || asset.accessibilityLabel;


        const url = asset['url-4K-SDR-240FPS'];
        const previewImage = asset.previewImage;

        if (label && url && previewImage) {
            const link = document.createElement('a');
            link.href = url;
            link.download = '';

            const img = document.createElement('img');
            img.src = previewImage;
            img.alt = label; // Alt text for the image


            link.appendChild(img);

            const text = document.createTextNode(label);
            link.appendChild(text);

            const listItem = document.createElement('li');
            listItem.appendChild(link);
            linksContainer.appendChild(listItem);
        }
    });
};
module.exports = createLinksList;