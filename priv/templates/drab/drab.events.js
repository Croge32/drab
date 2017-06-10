const EVENTS = ["click", "change", "keyup", "keydown"]
const EVENTS_TO_DISABLE = <%= Drab.Config.get(:events_to_disable_while_processing) |> Drab.Core.encode_js %>

Drab.disable_drab_objects = function(disable) {
  <%= if Drab.Config.get(:disable_controls_when_disconnected) do %>
    document.querySelectorAll("[drab-event]").forEach(function(element) {
      element['disabled'] = disable
    })
  <% end %>
}

//http://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function payload(sender, event) {
  p = default_payload(sender, event)
  Drab.additional_payloads.forEach(function(fx) {
    p = Object.assign(p, fx(sender, event))
  })
  return p
}

// default payload contains sender information and some info about event
function default_payload(sender, event) {
  return {
    sender: {
      // by default, we pass back some sender attributes
      id:       sender.getAttribute("id"),
      name:     sender.getAttribute("name"),
      class:    sender.getAttribute("class"),
      text:     sender.innerText,
      html:     sender.innerHTML,
      val:      sender.value,
      value:    sender.value,
      data:     sender.dataset,
      drab_id:  sender.getAttribute("drab-id") },
    event: {
      altKey:   event.altKey,
      data:     event.data,
      key:      event.key,
      keyCode:  event.keyCode,
      metaKey:  event.metaKey,
      shiftKey: event.shiftKey,
      ctrlKey:  event.ctlrKey,
      type:     event.type,
      which:    event.which,
      clientX:  event.clientX,
      clientY:  event.clientY,
      offsetX:  event.offsetX,
      offsetY:  event.offsetY,
      pageX:    event.pageX,
      pageY:    event.pageY,
      screenX:  event.screenX,
      screenY:  event.screenY
    }
  }
}

function do_setid(whom) {
  if (!whom.getAttribute("drab-id")) {
    whom.setAttribute("drab-id", uuid())
  }
}

Drab.setid = function(whom) {
  if (Array.isArray(whom)) {
    whom.forEach(function(x) {
      do_setid(x)
    })
  } else {
    do_setid(whom)
  }
}

function update_event_handler(node, event, func) {
  // TODO: learn more about event listeners
  // node.removeEventListener(event, func)
  // node.addEventListener(event, func)
  node["on" + event] = func
}

// set up the controls with drab handlers
Drab.set_event_handlers = function(obj) {
  var drab_objects = []
  var drab_objects_shortcut = []

  // first serve the shortcut controls by adding the longcut attrbutes
  EVENTS.forEach(function(ev) {
    if (obj) {
      var o = document.querySelector(obj)
      if (o) {
        drab_objects_shortcut = o.parentNode.querySelectorAll("[drab-" + ev + "]")
      }
    } else {
      drab_objects_shortcut = document.querySelectorAll("[drab-" + ev + "]")
    }
    // console.log(drab_objects_shortcut)
    drab_objects_shortcut.forEach(function(node) {
      node.setAttribute("drab-event", ev)
      node.setAttribute("drab-handler", node.getAttribute("drab-" + ev))
    })
  })

  if (obj) {
    var o = document.querySelector(obj)
    if (o) {
      drab_objects = o.parentNode.querySelectorAll("[drab-event]")
    }
  } else {
    drab_objects = document.querySelectorAll("[drab-event]")
  }

  var events_to_disable = EVENTS_TO_DISABLE
  drab_objects.forEach(function(node) {
    if(node.getAttribute("drab-handler")) {

      var event_handler_function = function(event) {
        // disable current control - will be re-enabled after finish
        <%= if Drab.Config.get(:disable_controls_while_processing) do %>
          if(events_to_disable.indexOf(event_name) >= 0) {
            node['disabled'] = true
          }
        <% end %>
        Drab.setid(node)
        // send the message back to the server
        Drab.run_handler(
          event_name,
          node.getAttribute("drab-handler"), 
          payload(node, event)
          <%= if Drab.Config.get(:disable_controls_while_processing) do %>
            , function() {
                node['disabled'] = false
              }
          <% end %>
          )
      }

      var event_name = node.getAttribute("drab-event")

      // options. Wraps around event_handler_function, eg. debounce(event_handler_function, 500)
      var options = node.getAttribute("drab-options")
      matched = /(\w+)\s*\((.*)\)/.exec(options)
      if(matched) {
        var fname = matched[1]
        var fargs = matched[2].replace(/^\s+|\s+$/g, '') // strip whitespace
        var f = fname + "(event_handler_function" + (fargs == "" ? "" : ", " + fargs) + ")"
        update_event_handler(node, event_name, eval(f))
      } else {
        update_event_handler(node, event_name, event_handler_function)
      }

    } else {
      console.log("Drab Error: drab-event definded without drab-handler", this)
    }
  })  
}

Drab.on_load(function(drab) {
  drab.disable_drab_objects(true)
})

Drab.on_disconnect(function(drab) {
  drab.disable_drab_objects(true)
})

Drab.on_connect(function(resp, drab) {
  drab.set_event_handlers()

  // re-enable drab controls
  drab.disable_drab_objects(false)
})