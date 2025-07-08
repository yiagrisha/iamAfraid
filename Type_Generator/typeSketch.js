let typeGeneratorSketch = function(p) {
   let canvas

   let font
   let Montserrat = []
   let Amarante = []
   let Press_Start_2P = []
   let NotoSansJP = []
   let Faculty_Glyphic = []
   const fontTypes = document.querySelectorAll('.select .options input')
   let selectedType
   
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

   const alignTabs = document.querySelectorAll('#text-align .radios .radio')
   const alignOptions = ['left', 'center', 'right', 'justify']
   let selectedAlign = 'left'

   p.preload = function() {
      Montserrat = p.loadFont('Materials/Montserrat/static/Montserrat-Regular.ttf')
      Amarante = p.loadFont('Materials/Amarante/Amarante-regular.ttf')
      Press_Start_2P = p.loadFont('Materials/Press_Start_2P/PressStart2P-Regular.ttf')
      NotoSansJP = p.loadFont('Materials/NotoSansJP-VariableFont_wght.ttf')
      Faculty_Glyphic = p.loadFont('Materials/Faculty_Glyphic/FacultyGlyphic-Regular.ttf')
      font = Montserrat
   }

   p.setup = function() {
      let container = document.querySelector('#canvas')
      canvas = p.createCanvas(container.offsetWidth, container.offsetHeight)
      canvas.parent(container)
      p.angleMode(p.DEGREES)

      for (let i = 0; i < fontTypes.length; i++) {
         fontTypes[i].addEventListener('change', function(event) {
            if(event.target.checked) {
               selectedType = i
               font = [Montserrat, Amarante, Press_Start_2P, NotoSansJP, Faculty_Glyphic][i]
               fontName = ['Montserrat', 'Amarante', 'Press_Start_2P', 'NotoSansJP', 'Faculty_Glyphic'][i]
               text.style.fontFamily = fontName
   
               updateContainerWidth()
            }
         })
      }

      for (let i = 0; i < alignTabs.length; i++) {
         alignTabs[i].addEventListener('change', function(event) {
            if(event.target.checked) {
               selectedAlign = alignOptions[i]
               text.style.textAlign = selectedAlign
            }
            updateContainerWidth()
         })
      }

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

         for (let i = 0; i < lines.length; i++) {
            const lineY = startY + i * lineHeight - baselineShift
            const chars = lines[i].split('')

            p.textFont(font)
            p.textSize(currentFontSize)

            // Получаем ширину всей строки
            const lineWidth = p.textWidth(lines[i])

            // Вычисляем отступ от начала строки в зависимости от выравнивания
            let xOffset = 0
            if (selectedAlign === 'center') {
               xOffset = (textContainer.offsetWidth - lineWidth) / 2
            } else if (selectedAlign === 'right') {
               xOffset = textContainer.offsetWidth - lineWidth
            } 

            let charX = sidePadding + xOffset

            if (selectedAlign === 'justify' && lines[i].indexOf(' ') !== -1) {
               let words = lines[i].split(' ')
               let totalWordWidth = 0
               for (let j = 0; j < words.length; j++) {
                  totalWordWidth += p.textWidth(words[j])
               }

               let gaps = words.length - 1
               let extraSpace = gaps > 0 ? (textContainer.offsetWidth - totalWordWidth) / gaps : 0
               let wordX = sidePadding

               for (let j = 0; j < words.length; j++) {
                  let word = words[j]
                  for (let k = 0; k < word.length; k++) {
                     let char = word[k]
                     let charWidth = p.textWidth(char)
                     let charPoints = font.textToPoints(char, wordX, lineY, currentFontSize, {
                        sampleFactor: 1,
                        simplifyThreshold: 0
                     })
                     points.push({ char: char, points: charPoints, x: wordX, y: lineY })
                     wordX += charWidth
                  }
                  wordX += extraSpace
               }

            } else {
               for (let c = 0; c < chars.length; c++) {
                  let char = chars[c]
                  p.textFont(font)
                  p.textSize(currentFontSize)
                  const charWidth = p.textWidth(char)
                  const charPoints = font.textToPoints(char, charX, lineY, currentFontSize, {
                     sampleFactor: 1,
                     simplifyThreshold: 0
                  })
                  points.push({ char, points: charPoints, x: charX, y: lineY })
                  charX += charWidth
               }
            }
         }
      }
      
      

   }
   
   p.draw = function() {
      p.background(255,224,135)
      
      /* POINTS AND TYPE FOR EVERY SYMBOL APART */
      for (let i = 0; i < points.length; i++) {
         const data = points[i]
         const char = data.char
         const charPoints = data.points
         const baseX = data.x
         const baseY = data.y

         // Центр буквы
         let avgX = 0, avgY = 0
         for (let pt of charPoints) {
            avgX += pt.x
            avgY += pt.y
         }
         avgX /= charPoints.length
         avgY /= charPoints.length

         const distToMouse = p.dist(p.mouseX, p.mouseY, avgX, avgY)
         const localRadius = p.map(distToMouse, 0, 200, 15, 5, true)
         const offsetX = localRadius * p.cos(angle) * parseFloat(radius)
         const offsetY = localRadius * p.sin(angle) * parseFloat(radius)

         for (let pt of charPoints) {
            p.stroke(255, 150, 10)
            p.line(pt.x, pt.y, pt.x + offsetX, pt.y + offsetY)
         }

      }

      for (let i = 0; i < points.length; i++) {
         const data = points[i]
         const char = data.char
         const charPoints = data.points
         const baseX = data.x
         const baseY = data.y

         // Центр буквы
         let avgX = 0, avgY = 0
         for (let pt of charPoints) {
            avgX += pt.x
            avgY += pt.y
         }
         avgX /= charPoints.length
         avgY /= charPoints.length

         const distToMouse = p.dist(p.mouseX, p.mouseY, avgX, avgY)
         const localRadius = p.map(distToMouse, 0, 200, 15, 5, true)
         const offsetX = localRadius * p.cos(angle) * parseFloat(radius)
         const offsetY = localRadius * p.sin(angle) * parseFloat(radius)
         // Отрисовка символа
         p.noStroke()
         p.fill(255, 120, 10)
         p.textAlign(p.LEFT, p.BASELINE)
         p.textFont(font)
         p.textSize(currentFontSize)
         p.text(char, baseX + offsetX, baseY + offsetY)
      }
      angle++
      
   }

   p.windowResized = function() {
      let container = document.querySelector('#canvas')
      p.resizeCanvas(container.offsetWidth, container.offsetHeight)
   }
}

new p5(typeGeneratorSketch)