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

export default Mistreevous;

// Export Mistreevous.
if (typeof module === 'undefined' || typeof module.exports === 'undefined') 
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