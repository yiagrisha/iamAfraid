let typeGeneratorSketch = function(p) {
   let canvas

   let font = []
   
   let text = document.querySelector('#preview #text')
   let textContainer = document.querySelector('#preview #container')
   let screen = document.querySelector('#preview')
   let userInput = document.querySelector('#text-input textarea')
   let msgContent = userInput.value
   let containerWidth = document.querySelector('#font-size input')

   let sidePadding
   let topBottomPadding
   let currentFontSize

   let lines = []
   let totalTextHeight 
   let lineHeight 

   let points = []
   let radiusInput = document.querySelector('#radius input')
   let radius = radiusInput.value
   let angle = 0

   p.preload = function() {
      font = p.loadFont('Materials/Montserrat/static/Montserrat-Regular.ttf')
   }

   p.setup = function() {
      let container = document.querySelector('#canvas')
      canvas = p.createCanvas(container.offsetWidth, container.offsetHeight)
      canvas.parent(container)
      p.angleMode(p.DEGREES)



      function updateContainerWidth() {
         textContainer.style.width = containerWidth.value + '%'
         updateFontSize()
      }
      updateContainerWidth()
      
      function updateFontSize() {
         text.innerText = userInput.value
         msgContent = userInput.value

         if(text.offsetHeight > textContainer.offsetHeight) {
            let b = 0
            let t = 400
         
            while(t-b > 0.05) {
               let m = (b+t)/2
               text.style.fontSize = m + 'px'
               currentFontSize = m
            
               if(text.offsetHeight <= textContainer.offsetHeight) {
                  b = m
               } else {
                  t = m
                  console.log(m)
               }
            } 
         } else {
            let l = 0
            let r = 400
         
            while(r-l > 0.05) {
               let m = (l+r)/2
               text.style.fontSize = m + 'px'
               currentFontSize = m
            
               if(text.offsetWidth < textContainer.offsetWidth) {
                  l = m
               } else {
                  r = m
               }
            }
         }

         updatePadding()
         updateTextLayout()
      }
      
      function updatePadding() {
         sidePadding = (screen.offsetWidth - textContainer.offsetWidth) / 2
         topBottomPadding = screen.offsetHeight - ((screen.offsetHeight - textContainer.offsetHeight) / 2) - textContainer.offsetHeight / 12
      }
      
      function updateTextLayout() {
         msgContent = userInput.value
         lines = msgContent.split('\n')
         lineHeight = currentFontSize 
         totalTextHeight = lines.length * lineHeight

         generatePoints()
      }
      
      userInput.addEventListener('input', updateFontSize)
      window.addEventListener('resize', updateFontSize)
      containerWidth.addEventListener('input', updateContainerWidth)


      radiusInput.addEventListener('input', function() {radius = radiusInput.value})




      function generatePoints() {
         points = []
         const startY = topBottomPadding - totalTextHeight + lineHeight
         const baselineShift = currentFontSize * 0.25

         for(let i = 0; i < lines.length; i++) {
            const lineY = startY + i * lineHeight - baselineShift
            const linePoints = font.textToPoints(lines[i], sidePadding, lineY, currentFontSize, {sampleFactor: 0.9, simplifyThreshold: 0})
            points.push(...linePoints)
         }
      }

      
   }
   
   p.draw = function() {
      p.background(255,224,135)
      p.textFont(font)
      p.textSize(currentFontSize)
      p.textAlign(p.LEFT, p.BOTTOM)
      
      p.fill(230,100,0, 255)
      p.stroke(255,135,0)
      
      /* const startY = topBottomPadding - totalTextHeight + lineHeight
      for(let i = 0; i < lines.length; i++) {
         p.text(lines[i], sidePadding, startY + i * lineHeight)
      } */




      /* LINE ANIMATION */
      let x =  radius*p.cos(angle)
      let y = radius*p.sin(angle)

      for(let i = 0; i < points.length; i++) {
         if(points[i].alpha == 180) {
            p.stroke(255, 30, 0)
         } else if(points[i].alpha == 90) {
            p.stroke(30, 100, 0)
         } else if(points[i].alpha > 90 && points[i].alpha < 180) {
            p.stroke(30, 50, 150)
         } else {
            p.stroke(0, 0, 0)
         }
         p.line(points[i].x, points[i].y, points[i].x + x, points[i].y + y)
      }

      const startY = topBottomPadding - totalTextHeight + lineHeight
      for(let i = 0; i < lines.length; i++) {
         p.noStroke()
         p.text(lines[i], sidePadding + x, startY + i * lineHeight + y)
      }
      angle++








   }

   p.windowResized = function() {
      let container = document.querySelector('#canvas')
      p.resizeCanvas(container.offsetWidth, container.offsetHeight)
   }
}

new p5(typeGeneratorSketch)