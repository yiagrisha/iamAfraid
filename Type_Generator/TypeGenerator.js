let text = document.querySelector('#preview #text')
let textContainer = document.querySelector('#preview #container')
let userInput = document.querySelector('#text-input textarea')

function updateFontSize() {
   text.innerText = userInput.value

   let l = 0
   let r = 400

   while(r-l > 0.05) {
      let m = (l+r)/2
      text.style.fontSize = m + 'px'
    
      if(text.offsetWidth < textContainer.offsetWidth) {
         l = m
      } else {
         r = m
      }
   }
}
updateFontSize()

userInput.addEventListener('input', updateFontSize)