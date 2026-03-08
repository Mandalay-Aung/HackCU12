document.addEventListener('DOMContentLoaded', function () {
  var button = document.getElementById('start');
  button.addEventListener('click', function () {
      var audio = new Audio('bubbly.mp3');
        audio.play();
    
    chrome.windows.create({
        url: '1pop.html',
        type: 'popup',
        width: 80,
        height: 150,
        left: 5,
        top:5
  });
        function popup2(){
        chrome.windows.create({
            url: '2popup.html',
            type: 'popup',
            width: 80,
            height: 150,
            left: 5,
            top: 5

        });
        }

        function popup3(){
        chrome.windows.create({
            url: '3pop.html',
            type: 'popup',
            width: 80,
            height: 150,
            left: 15,
            top: 5

        });
        }

        function popup4(){
        chrome.windows.create({
            url: '4pop.html',
            type: 'popup',
            width: 80,
            height: 150,
            left: 25,
            top: 5

        });
        }

        function popup5(){
        chrome.windows.create({
            url: '5pop.html',
            type: 'popup',
            width: 80,
            height: 150,
            left: 35,
            top: 5

        });
        }

        function popup6(){
        chrome.windows.create({
            url: '6pop.html',
            type: 'popup',
            width: 80,
            height: 150,
            left: 45,
            top: 5

        });
        }
    
        function popup7(){ //icame in
        chrome.windows.create({
            url: '7pop.html',
            type: 'popup',
            width: 200,
            height: 110,
            left: 45,
            top: 5

        });
        }

        function popup8(){ //abit befreo
        chrome.windows.create({
            url: '8pop.html',
            type: 'popup',
            width: 200,
            height: 110,
            left: 85,
            top: 25

        });
        }

        function popup9(){ //the opening set
        chrome.windows.create({
            url: '9pop.html',
            type: 'popup',
            width: 250,
            height: 285,
            left: 120,
            top: 25

        });
        }

        function popup10(){ //i took the bet
        chrome.windows.create({
            url: '10pop.html',
            type: 'popup',
            width: 250,
            height: 285,
            left: 140,
            top: 25

        });
        }
    
    
    setTimeout(popup2, 500);
    setTimeout(popup3, 1500); //drums
    setTimeout(popup4, 2200);
    setTimeout(popup5, 2900);
    setTimeout(popup6, 3500);
    setTimeout(popup7, 3500); //i camein
    setTimeout(popup8, 4300);//a bit before
    setTimeout(popup9, 5000); //theopening set
    setTimeout(popup10, 6000); //i tookthebet
    
    
});
});