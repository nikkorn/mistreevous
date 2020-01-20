/**
 * A simple enemy
 */
function Enemy({ x, y, behaviourTreeDefinition }, player) {
    /**
     * The enemy position.
     */
    this.x = x;
    this.y = y;
    /**
     * The enemy movement offset.
     */
    this.movement = { x: 0, y: 0 };
    /**
     * The enemy behaviour tree.
     */
    this.behaviourTree = new Mistreevous.BehaviourTree(behaviourTreeDefinition, this);

    // TODO Figure out why 'this' is WINDOW in every function() here called by mistreevous.
    // 'this' is actually the enemy instance when using the arrow function syntax.
    const self = this;

    /**
     * Get the player movement.
     */
    this.getMovement = function() {
        return this.movement;
    };

    /**
     * Gets the x position.
     */
    this.getX = function() {
        return this.x;
    };

    /**
     * Gets the y position.
     */
    this.getY = function() {
        return this.y;
    };

    /**
     * Gets the size.
     */
    this.getSize = function() {
        return CHARACTER_SIZE;
    };

    /**
     * The enemy tick.
     */
    this.tick = function() {
        // Stop the enemy from moving.
        this.movement = { x: 0, y: 0 };

        // Step the behaviour tree.
        this.behaviourTree.step();
    };

    /**
     * Move the enemy.
     */
    this.move = function(xOffset, yOffset) {
        this.x += xOffset;
        this.y += yOffset;
    };

    /**
     * Called when the enemy spots the player.
     */
    this.OnPlayerSpotted = function() {
        const speechOptions = ["There you are!", "I've spotted you!", "Get over here!", "I've got you now!"];
        speak("enemy", speechOptions[Math.floor(Math.random() * speechOptions.length)]);
        return Mistreevous.State.SUCCEEDED;
    };

    /**
     * Called when the enemy loses the player.
     */
    this.OnPlayerLost = function() {
        const speechOptions = ["Darn it!", "I will get you next time!", "You are too fast for me!", "You wont be so lucky next time!"];
        speak("enemy", speechOptions[Math.floor(Math.random() * speechOptions.length)]);
        return Mistreevous.State.SUCCEEDED;
    };

    /**
     * Chat about nothing.
     */
    this.DoIdleChat = function() {
        const speechOptions = ["I'm so bored!", "When is lunch?", "*whistles*", "I'm hungry!"];
        speak("enemy", speechOptions[Math.floor(Math.random() * speechOptions.length)]);
        return Mistreevous.State.SUCCEEDED;
    };

    /**
     * Get whether the player is near this enemy.
     */
    this.IsPlayerNearby = function() {
        const getDistance = (x1, y1, x2, y2) => {
            const diff = (num1, num2) => {
                if (num1 > num2) {
                    return (num1 - num2);
                } else {
                    return (num2 - num1);
                }
            };

            var deltaX = diff(x1, x2);
            var deltaY = diff(y1, y2);
            var dist   = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            return (dist);
        };
        
        return getDistance(player.getX(), player.getY(), self.getX(), self.getY()) < 50;
    };

    /**
     * Move towards the player. 
     */
    this.MoveTowardsPlayer = () => {
        // If the player is no longer near us then we have finished following them. 
        if (!this.IsPlayerNearby()) {
            return Mistreevous.State.SUCCEEDED;
        }

        // Follow the player at only half the player speed.
        const enemyOffsetX = player.getX() > self.getX() ? CHARACTER_MOVEMENT * 0.5 : CHARACTER_MOVEMENT * -0.5;
        const enemyOffsetY = player.getY() > self.getY() ? CHARACTER_MOVEMENT * 0.5 : CHARACTER_MOVEMENT * -0.5;
        self.movement = { x: enemyOffsetX, y: enemyOffsetY };
    };
};