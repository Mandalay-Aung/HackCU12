let counter=1;

document.getElementById("counter").onmousemove= function () {
    
    counter++;
    let string = counter.toString();
    
    document.getElementById("display").textContent = string;


};
