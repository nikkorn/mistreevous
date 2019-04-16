/**
 * Populates the SVG with connectors.
 */
function populateConnectorSVG(svg, points, lineOptions, direction)
{
    var resolvedOptions = {
        type: lineOptions.type || "angled",
        thickness: lineOptions.thickness || 2,
        colour: lineOptions.colour || "#4c4c4c",
        cap: lineOptions.cap || "square"
    };

    // Function to create a SVG line which represents a connector.
    var drawLine = function (x1, y1, x2, y2) 
    {
        var connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        connector.setAttribute('x1', x1);
        connector.setAttribute('y1', y1);
        connector.setAttribute('x2', x2);
        connector.setAttribute('y2', y2);
        connector.setAttribute('stroke', resolvedOptions.colour);
        connector.setAttribute('stroke-width', resolvedOptions.thickness);
        connector.setAttribute('stroke-linecap', resolvedOptions.cap);
        svg.appendChild(connector);
    };

    // The draw layouts defining the strategies for drawing connector lines.
    var drawLayouts = {
        horizontal: {
            straight: function () 
            {
                for (var i = 0; i < points.length; i++)
                {
                    drawLine(0, "50%", "105%", points[i]);
                }
            },
            angled: function () 
            {
                drawLine(0, "50%", "50%", "50%");

                for (var i = 0; i < points.length; i++)
                {
                    drawLine("50%", "50%", "50%", points[i]);
                    drawLine("50%", points[i], "100%", points[i]);
                }
            }
        },
        vertical: {
            straight: function () 
            {
                for (var i = 0; i < points.length; i++)
                {
                    drawLine("50%", "0%", points[i], "100%");
                }
            },
            angled: function () 
            {
                drawLine("50%", "0%", "50%", "50%");

                for (var i = 0; i < points.length; i++)
                {
                    drawLine("50%", "50%", points[i], "50%");
                    drawLine(points[i], "50%", points[i], "100%");
                }
            }
        }
    };

    // Use the desired strategy to draw the connectors.
    drawLayouts[direction][resolvedOptions.type]();
}