---
layout: post
title: Less for tail
author: Ondrej Platek
tags:  Shell, Utilities
---

``Less`` is nice for previewing, searching and moving around in logs but ``tail -f`` is nice for following logs to which content is gradually appended.

However, if you use ``-F`` parameter for less or *press* ``Shift + F`` in less default mode you switch to  *tail* behaviour.
If you want to move around the log file again *press* ``Ctrl+C`` *once*.
