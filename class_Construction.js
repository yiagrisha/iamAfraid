class TumbleBase {
  constructor() {
    this.lets = [];
    this.build();
  }

  build() {
    var leading = 10;
    var tracking = (selFont == 5) ? 5 : 0;

    maxDist = 0;

    for (let p = 0; p < inputText.length; p++) {
      for (let m = 0; m < inputText[p].length; m++) {
        let nextW = textWidth(inputText[p].substring(0, m + 1));
        let thisW = textWidth(inputText[p].charAt(m));

        let x = nextW - thisW;
        let y = p * pgTextSize * tFontFactor[selFont];

        if (alignMode == 0) {
          x -= fullW / 2;
        } else if (alignMode == 1) {
          x -= (textWidth(inputText[p]) + (inputText[p].length - 1) * tracking) / 2;
        } else if (alignMode == 2) {
          x += fullW / 2;
          x -= textWidth(inputText[p]);
        }

        x += (m - 1) * tracking;

        y -= -pgTextSize * tFontFactor[selFont] + inputText.length * pgTextSize * tFontFactor[selFont] / 2;
        y -= (inputText.length - 1) * leading / 2;
        if (p > 0) {
          y += p * leading;
        }

        if (inputText[p].charAt(m) !== " ") {
          const tumbleLet = new TumbleLet(x, y, p, m);
          this.lets.push(tumbleLet);

          const meas = dist(x, y, mouseCenter.x, mouseCenter.y);
          if (meas > maxDist) {
            maxDist = meas;
          }
        }
      }
    }

    this.liveReset();
    this.tickerReset();
  }

  run() {
    for (let m = 0; m < this.lets.length; m++) {
      this.lets[m].run();
    }
  }

  liveReset() {
    for (let m = 0; m < this.lets.length; m++) {
      this.lets[m].liveReset();
    }
  }

  tickerReset() {
    for (let m = 0; m < this.lets.length; m++) {
      this.lets[m].tickerReset();
    }
  }
}


function generatePoints() {
         points = []
         const startY = topBottomPadding - totalTextHeight + lineHeight
         const baselineShift = currentFontSize * 0.25

         for (let i = 0; i < lines.length; i++) {
            const lineY = startY + i * lineHeight - baselineShift
            const chars = lines[i].split('')

            textFont(font)
            textSize(currentFontSize)

            // Получаем ширину всей строки
            const lineWidth = textWidth(lines[i])

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
                  totalWordWidth +=textWidth(words[j])
               }

               let gaps = words.length - 1
               let extraSpace = gaps > 0 ? (textContainer.offsetWidth - totalWordWidth) / gaps : 0
               let wordX = sidePadding

               for (let j = 0; j < words.length; j++) {
                  let word = words[j]
                  for (let k = 0; k < word.length; k++) {
                     let char = word[k]
                     let charWidth =textWidth(char)
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
               textFont(font)
               textSize(currentFontSize)
                  const charWidth =textWidth(char)
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
