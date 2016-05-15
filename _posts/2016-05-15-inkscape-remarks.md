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
However, the official OSX stable version uses X-server a Linux port of X-window server and it sucks.
I use [an unofficial testing version](https://inkscape.org/en/gallery/item/6061/) which does not use X-server and it feels like native application on OSX. I experienced only minor stability issues.

The important difference is that one uses `Cmd + SHORTCUT` instead `Ctrl + SHORTCUT`.

Creating shapes
---------------
Select *rectangles* (`F4`) or *elipsis* (`F5`), and by dragging adjust the size.
If you pres `Ctrl` while dragging you create squares and circles instead of rectangles and ellipsis.
If you pres `Shift` the object is changing size from center not from top left corner.

Creating complex shapes
-----------------------
Select objects (by clicking on an objects, by dragging a selected area over whole objects or if you press `Shift` you can select objects multiple times).
Copy them by pressing `Ctrl + C` and paste them under cursor using `Ctrl+V`.
By pressing `Ctrl + D` the objects are duplicated and they remain on the same coordinates.
If you want to maintain complex shape from multiple objects grouping objects by `Ctrl + G` is very useful .

Colors
------
Changing colours is trivial in *Fill and Stroke* menu (`Shift + Ctrl+ F`).
A really handy tool for duplicating colour is  a **dropper** (`F7`) which fills the color of previously selected objects to object on which you click.
If you press `Shift` it will change a stroke instead of a filling of the clicked object.
Lowering opacity is especially useful if you want to create shapes according bitmap image in lower layers.

Layers
------
Layers are wonderful tool to separate your work in multiple blocks.
Some layers can be used only as helpers and are never intended to be part of the final results.
For example you can import a bitmap into separate layer and in new layers create a vector graphics which resembles the original bitmap.

One can use multiple layers for creating [animations in Inkscape](http://wiki.inkscape.org/wiki/index.php/Animation-(Layers)).
One typically design an animation frame per one layer and then export it to [sprite sheets](https://www.codeandweb.com/what-is-a-sprite-sheet).

Nodes and Bezier curves
-----------------------
Nodes on shapes let you easily modify their (Bezier) curves. 
The most important trick to know is to *Edit path by nodes* (`F2`) because you can manually adjust any shape by inserting (*by double clicking on the edge of shape*) and changing nodes. 
You can modify even a text font which is really cool.
Great examples of path editing are in [Inkscape advanced tutorial](https://inkscape.org/en/doc/tutorials/advanced/tutorial-advanced.en.html)
