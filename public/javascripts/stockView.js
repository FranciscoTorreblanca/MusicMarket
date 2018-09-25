
    var price = 100
    var pLabel=document.getElementById('price-label')
    var bInput= document.getElementById('buy-quantity')
    var sInput= document.getElementById('sell-quantity')
    var bTotal=document.getElementById('buy-total')
    var sTotal=document.getElementById('sell-total')

    // pLabel.innerHTML=`Price:${price}`

    sInput.addEventListener('input', function()
    {
        sTotal.innerHTML=`Total ${sInput.value * price}`
    });

        bInput.addEventListener('input', function()
    {
        bTotal.innerHTML=`Total ${bInput.value * price}`
    });
