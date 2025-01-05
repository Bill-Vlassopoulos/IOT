const dropdown = document.getElementById("dropdown");
const dropdown1 = document.getElementById("dropdown1");

const fanaria = {
    "v3_omada14_diastavrosi_0": ["v3_omada14_fanari_0", "v3_omada14_fanari_1", "v3_omada14_fanari_2", "v3_omada14_fanari_3"],
    "v3_omada14_diastavrosi_1": ["v3_omada14_fanari_4", "v3_omada14_fanari_5", "v3_omada14_fanari_6", "v3_omada14_fanari_7"],
    "v3_omada14_diastavrosi_2": ["v3_omada14_fanari_8", "v3_omada14_fanari_9", "v3_omada14_fanari_10", "v3_omada14_fanari_11"],
    "v3_omada14_diastavrosi_3": ["v3_omada14_fanari_12", "v3_omada14_fanari_13", "v3_omada14_fanari_14", "v3_omada14_fanari_15"],
    "v3_omada14_diastavrosi_4": ["v3_omada14_fanari_16", "v3_omada14_fanari_17", "v3_omada14_fanari_18", "v3_omada14_fanari_19"],
}

function addOptions(selectElement, options) {
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = options.indexOf(option);
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

function removeOptions(selectElement) {
    while (selectElement.options.length > 0) {
        selectElement.remove(0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    addOptions(dropdown, Object.keys(fanaria));
});


dropdown.addEventListener('change', (e) => {
    const selected = e.target.options[e.target.selectedIndex].text;
    console.log(selected);
    console.log(fanaria[selected]);
    removeOptions(dropdown1);
    addOptions(dropdown1, fanaria[selected]);
});




