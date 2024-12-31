const dropdown = document.getElementById("dropdown");
const dropdown1 = document.getElementById("dropdown1");

const fanaria = {
    "v2_omada14_diastavrosi_0": ["v2_omada14_fanari_0", "v2_omada14_fanari_1", "v2_omada14_fanari_2", "v2_omada14_fanari_3"],
    "v2_omada14_diastavrosi_1": ["v2_omada14_fanari_4", "v2_omada14_fanari_5", "v2_omada14_fanari_6", "v2_omada14_fanari_7"],
    "v2_omada14_diastavrosi_2": ["v2_omada14_fanari_8", "v2_omada14_fanari_9", "v2_omada14_fanari_10", "v2_omada14_fanari_11"],
    "v2_omada14_diastavrosi_3": ["v2_omada14_fanari_12", "v2_omada14_fanari_13", "v2_omada14_fanari_14", "v2_omada14_fanari_15"],
    "v2_omada14_diastavrosi_4": ["v2_omada14_fanari_16", "v2_omada14_fanari_17", "v2_omada14_fanari_18", "v2_omada14_fanari_19"],
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




