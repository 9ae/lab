# Goal: Implement ipad gestures on canvas with touch events

# Create a drawing canvas with a redo & undo stack

- [x] Make drawing canvas
- [x] Implement redo undo stack
- [ ] Detech undo/redo via touch events
- [ ] Overwrite on new command when in the middle of a stack

# Our command stack

How do we implement our command stack?

Option 1:
i = n-1
[....(.).]
 
Option 2:
history: [..]
future: [..]
and we draw from history, and push to future on undo

5/13:
Issue: Our drawing stack is not drawing. Why?
-> We weren't pushing our arrays correct