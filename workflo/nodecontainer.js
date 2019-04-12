/**
 * A node container.
 */
function NodeContainer () 
{
    this.nodeContainer             = document.createElement("div");
    this.nodeContainer.className   = "node-container";
    this.parentContainer           = document.createElement("div");
    this.parentContainer.className = "parent-container";
    this.childContainer            = document.createElement("div");
    this.childContainer.className  = "child-container";
    this.nodeContainer.appendChild(this.parentContainer);
    this.nodeContainer.appendChild(this.childContainer);
};