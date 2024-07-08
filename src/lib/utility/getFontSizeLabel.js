export default function getFontSizeLabel() {
  // Get the root element
  const root = document.documentElement;

  // Get the computed style of the root element
  const computedStyle = getComputedStyle(root);

  // Get the value of the --fs-label custom property
  const fsLabel = computedStyle.getPropertyValue('--fs-label').trim();

  // Extract the font size of the root element (1rem in pixels)
  const rootFontSize = parseFloat(computedStyle.fontSize);

  // Extract the viewport width in pixels
  const viewportWidth = window.innerWidth;

  // Function to evaluate the CSS expression
  function evaluateCssExpression(expression) {
      // Replace `rem` with the corresponding pixel value
      expression = expression.replace(/([\d.]+)rem/g, (match, p1) => parseFloat(p1) * rootFontSize + 'px');
      
      // Replace `vw` with the corresponding pixel value
      expression = expression.replace(/([\d.]+)vw/g, (match, p1) => parseFloat(p1) * viewportWidth / 100 + 'px');
      
      // Create a temporary element to evaluate the expression
      const tempElement = document.createElement('div');
      tempElement.style.width = expression;
      document.body.appendChild(tempElement);
      
      // Get the computed width in pixels
      const evaluatedValue = parseFloat(getComputedStyle(tempElement).width);
      
      // Clean up
      document.body.removeChild(tempElement);
      
      return evaluatedValue;
  }

  // Evaluate the CSS expression
  const pixelValue = evaluateCssExpression(fsLabel);

  return pixelValue
}