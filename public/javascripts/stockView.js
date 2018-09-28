
    var price=parseInt(document.getElementById('price-label').innerHTML)
    var bInput= document.getElementById('buy-quantity')
    var sInput= document.getElementById('sell-quantity')
    var bTotal=document.getElementById('buy-total')
    var sTotal=document.getElementById('sell-total')

    sInput.addEventListener('input', function()
    {
        sTotal.innerHTML=`Total $${sInput.value * price}`
    });

        bInput.addEventListener('input', function()
    {
        bTotal.innerHTML=`Total $${bInput.value * price}`
    });

    var modal = document.getElementById('trade-form')
    var elements = document.getElementsByClassName('toggle-modal');
    for (var i = 0; i < elements.length; i++) {
      elements[i].addEventListener('click', toggleClass);
    }
  
    function toggleClass() {
      modal.classList.toggle('is-active');
    }
  
    
