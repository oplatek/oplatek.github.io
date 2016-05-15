---
layout: post
title: Inkscape remarks
author: Ondrej Platek
tags: Inkscape, graphics, tools
---

I use Inkscape mainly for creating posters and diagrams, but it can easily do much more. 

Version
-------
Inkscape can be used natively on Linux and Windows.
However, the official stable version uses X-server a Linux port of X-window server to OSX, which sucks.
I use [an unofficial testing version](https://inkscape.org/en/gallery/item/6061/) does not use X-server and feels like native application on OSX. I experienced only minor stability issues.

The only difference for me that I use `Cmd + SHORTCUT` instead `Ctrl + SHORTCUT`.

Creating shapes
---------------
Select *rectangles* (`F4`) or *elipsis* (`F5`), and by dragging adjust the size.
If you pres `Ctrl` while dragging you create squares and circles instead of rectangles and ellipsis.
If you pres `Shift` the object is changing size from center not from top left corner.

Creating complex shapes
-----------------------
Select objects (by clicking on an objects, by dragging a selected area over whole objects, if you press `Shift` you can select multiple times).
Copy them by pressing `Ctrl + C` and inserting them pasting them under cursor using `Ctrl+V`.
By `Ctrl + D` you duplicate the objects which remain on the same coordinates.
Grouping objects by `Ctrl + G` is very useful if you want to maintain complex shape from multiple objects.

Colors
------
Changing colours is trivial in *Fill and Stroke* menu (`Shift + Ctrl+ F`).
A really handy tool is  a **dropper** (`F7`) which fills the color of previously selected objects with colour an area on which you click.
If you press `Shift` it will change a stroke instead of a filling of previously selected object.
Lowering opacity is useful if you want to create shapes according bitmap image in lower layers.

Layers
------
Layers are wonderful tool to separate your work in multiple blocks.
Some layers can be used only as helpers and are never intended to be part of the final results.
For example you can import a bitmap into separate layer and in new layers create a vector graphics which resembles the original bitmap.
One can use multiple layers for creating animations.

Another cool usage is a creating an [animations in Inkscape](http://wiki.inkscape.org/wiki/index.php/Animation-(Layers).
One typically design an animation frame per one layer and then export it to [sprite sheets](https://www.codeandweb.com/what-is-a-sprite-sheet).

Nodes and Bezier curves
-----------------------
Nodes on shapes let you easily modify their (Bezier) curves. The most important trick to know is to *Edit path by nodes* (`F2`) because you can manually adjust any shape by inserting and changing nodes. You can modify even a text font which is really cool.
Great examples of path editing are in [Inkscape advanced tutorial](https://inkscape.org/en/doc/tutorials/advanced/tutorial-advanced.en.html)
