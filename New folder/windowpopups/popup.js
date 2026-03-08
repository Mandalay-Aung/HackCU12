function openCustomPositionedPopup() {
    let url = 'popup.html';
    let width = 600;
    let height = 400;
    // Calculate the desired position (e.g., top-left corner)
    let left = 50; 
    let top = 50; 

    // Open the window with specific arguments
    let newWindow = window.open(
        url, 
        'popUpWindow', 
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    // The moveBy() and moveTo() methods can be used to reposition it after opening, 
    // but they only work reliably on popups you opened and are often blocked by browsers to prevent abuse.
}


