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
            height: 180,
            left: 180,
            top: 15

        });
        }

        function popup11(){ //i know the
        chrome.windows.create({
            url: '11pop.html',
            type: 'popup',
            width: 250,
            height: 100,
            left: 220,
            top: 35

        });
        }

        function popup11a(){ // the
        chrome.windows.create({
            url: '11pop2.html',
            type: 'popup',
            width: 80,
            height: 90,
            left: 220,
            top: 120

        });
        }

        function popup12(){ //rest
        chrome.windows.create({
            url: '12pop.html',
            type: 'popup',
            width: 250,
            height: 90,
            left: 300,
            top: 120

        });
        }

        function popup13(){ //it's good
        chrome.windows.create({
            url: '13pop.html',
            type: 'popup',
            width: 250,
            height: 90,
            left: 500,
            top: 20

        });
        }

        function popup14(){ //I
        chrome.windows.create({
            url: '14pop.html',
            type: 'popup',
            width: 250,
            height: 90,
            left: 500,
            top: 100

        });
        }

        function popup15(){ //guess
        chrome.windows.create({
            url: '15pop.html',
            type: 'popup',
            width: 250,
            height: 90,
            left: 600,
            top: 100

        });
        }
        function popup16(){ //the cavern
        chrome.windows.create({
            url: '16pop.html',
            type: 'popup',
            width: 250,
            height: 90,
            left: 700,
            top: 20

        });
        }

        function popup17(){ //is a crowd
        chrome.windows.create({
            url: '17pop.html',
            type: 'popup',
            width: 250,
            height: 90,
            left: 700,
            top: 100

        });
        }
    
    
    setTimeout(popup2, 500);
    setTimeout(popup3, 1500); //drums
    setTimeout(popup4, 2200);
    setTimeout(popup5, 2900);
    setTimeout(popup6, 3500);
    setTimeout(popup7, 3500); //i camein
    setTimeout(popup8, 4300);//a bit before
    setTimeout(popup9, 5100); //theopening set
    setTimeout(popup10, 6300); //i tookthebet
    setTimeout(popup11, 7300); //i know 
    setTimeout(popup11a, 7900); //the
    setTimeout(popup12, 8200); //rest   
    setTimeout(popup13, 8600); //it5's good
    setTimeout(popup14, 9200); //I
    setTimeout(popup15, 9500); //guess
    setTimeout(popup16, 10000); //the cavern
    setTimeout(popup17, 10500); //is a crowd
    
    
});
});