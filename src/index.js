import BehaviourTree from './behaviourtree'

const Mistreevous = {
    BehaviourTree,
    State: {
        READY: Symbol("mistreevous.ready"),
        RUNNING: Symbol("mistreevous.running"),
        SUCCEEDED: Symbol("mistreevous.succeeded"),
        FAILED: Symbol("mistreevous.failed")
    }
};

// Export Mistreevous.
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') 
{
    module.exports = Mistreevous;
}
else 
{
    if (typeof define === 'function' && define.amd) 
    {
        define([], function() 
        {
            return Mistreevous;
        });
    }
    else 
    {
        window.Mistreevous = Mistreevous;
    }
}