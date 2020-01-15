/**
 * A node.
 */
function Node (item, options, direction) 
{
    // The node properties.
    this.id     = function () { return this.item[options.nodeIdField] };
    this.name   = function () { return this.item[options.nodeNameField] };
    this.type   = function () { return this.item[options.nodeTypeField] };
    this.parent = function () { return this.item[options.nodeParentField] };

    // The item backing the node.
    this.item = item;

    // The depth of the node in the node tree.
    this.depth = 1;

    // The children of this node.
    this.children = [];

    // The SVG on which to draw node connectors.
    this._connectorSVG;

    // The parent DOM element of this node.
    this._parentContainer;

    /**
     * Appends the node DOM element to a parent element.
     */
    this.attachToParentContainer = function (parent) 
    { 
        // Grab a reference to the parent container.
        this._parentContainer = parent;

        // Create a wrapper div for the element.
        var wrapper        = document.createElement("div"); 
        wrapper.className  = "template-wrapper";

        // Use the default template to create the element.
        wrapper.innerHTML = this._getTemplateFunction(options.definition || {})(this);

        // If an onclick callback was defined in the options then hook it up to a press of the wrapped div.
        if (options.onclick && typeof options.onclick === "function")
        {
            wrapper.addEventListener("click", function () { options.onclick(item); });
        }

        // Create the SVG.
        this._connectorSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        // Set the initial attributes.
        this._connectorSVG.setAttributeNS(null, "class", "connector-svg");

        // Create a wrapper for the SVG. 
        var connectorSVGWrapper       = document.createElement("div"); 
        connectorSVGWrapper.className = "connector-svg-wrapper";
        connectorSVGWrapper.appendChild(this._connectorSVG);

        // Append the node element to the target container.
        parent.appendChild(wrapper);

        // Append the connectors SVG wrapper the the target container.
        parent.appendChild(connectorSVGWrapper);
    }

    /**
     * Draw the parent -> child connectors for this node.
     */
    this.drawConnectors = function () { 
        var childPositionOffset = 0;
        var points              = [];

        // How we find the connector points depends on the layout direction.
        if (direction === "horizontal") {
            // Draw a connector for each child of this node.
            for (var i = 0; i < this.children.length; i++)
            {
                // Get the current child.
                var child = this.children[i];

                // Get the height of the child.
                var childHeight = child.getHeight();

                // Calculate the end point of the connector, which should be aligned with the child element.
                var childConnectorOffset = childPositionOffset + (childHeight / 2);

                points.push(((childConnectorOffset / this.getHeight()) * 100) + "%");

                // Add the child height to the offset.
                childPositionOffset += childHeight;
            }
        } else {
            // Draw a connector for each child of this node.
            for (var i = 0; i < this.children.length; i++)
            {
                // Get the current child.
                var child = this.children[i];

                // Get the width of the child.
                var childWidth = child.getWidth();

                // Calculate the end point of the connector, which should be aligned with the child element.
                var childConnectorOffset = childPositionOffset + (childWidth / 2);

                points.push(((childConnectorOffset / this.getWidth()) * 100) + "%");

                // Add the child width to the offset.
                childPositionOffset += childWidth;
            }
        }

        populateConnectorSVG(this._connectorSVG, points, options.line || {}, direction);
    }

    /**
     * Get the height of this node in the DOM.
     */
    this.getHeight = function () { return this._parentContainer ? this._parentContainer.offsetHeight : 0; }

    /**
     * Get the width of this node in the DOM.
     */
    this.getWidth = function () { return this._parentContainer ? this._parentContainer.offsetWidth : 0; }

    /**
     * Returns whether this is a root node.
     */
    this.isRoot = function () { return !this.parent();  }

    /**
     * Get the template function to use for creating the node element.
     */
    this._getTemplateFunction = function (definition) 
    { 
        // Firstly, attempt to find a template function based on the node type.
        var matchingType = this._findAdditionalDefinitionByType(definition, this.type());

        if (matchingType && matchingType.template && typeof matchingType.template === "function")
        {
            return matchingType.template;
        } 
        else if (definition.default && definition.default.template && typeof definition.default.template === "function") 
        {
            return definition.default.template;
        } 
        else 
        {
            // Get the node name.
            const nodeName = this.name();

            return function () { return "<div class='workflo-default-node'><p>" + nodeName + "</p></div>" };
        }
    };

    /**
     * Find an additional definition by type.
     * Returns undefined if one does not exist.
     */
    this._findAdditionalDefinitionByType = function (definition, typeValue) 
    { 
        var additional = definition.additional || [];

        for (var i = 0; i < additional.length; i++)
        {
            if (additional[i].type === typeValue)
            {
                // We found the additional definition of the specified type.
                return additional[i];
            }
        }

        // There is no additional definition of the specified type.
        return undefined;
    };
}