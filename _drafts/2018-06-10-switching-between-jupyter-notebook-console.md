---
layout: post
title: Switching between IPython console and notebook
author: Ondrej Platek
tags: Python, IPython
---
I love IPython console for simple interactive prototyping and I sometimes use IPython notebook for presenting my code and visualizing results or debugging information.

Previously, I need to save my ``ipython console`` and reload it to new ``ipython notebook``, but I knew it should be possible to connect to the same Python kernel which evaluates the code behind the scene and share my session between ``notebook`` and ``console`` on the fly.

The scenario looked like this:

```sh
$ ipython
In [1]: x = range(10)
In [2]: %notebook -e test.ipynb
```

In another shell, I launched the ``ipython notebook`` and opened ``test.ipyndb`` via graphical interface.
Then,  in the ``test.ipyndb`` notebook,  I plot the ``x``.

```python
In [1]: x = range(10)
In [3]: %matplotlib inline
        import matplotlib.pyplot as plt
In [4]: plt.plot(x)%matplotlib inline
```


After I upgraded IPython to 3.2.0, changing launch command from ``ipython`` to ``ipython console``,  I am able to connect ``ipython notebook`` any time later so I can visualize my data.

*The improved workflow: SADLY NOT WORKING*

* Start ``ipython console``
* Do some work

```python
In [1]: x = range(10)
```
* If you need to visualize your data
    - In your ``ipython console`` run ``connect_info`` and check its output:

```python
In [2]: %connect_info
    {
        "stdin_port": 58725,
        "ip": "127.0.0.1",
        "control_port": 58726,
        "hb_port": 58727,
        "signature_scheme": "hmac-sha256",
        "key": "76557205-208a-40c1-8983-5490eb6962e3",
        "shell_port": 58723,
        "transport": "tcp",
        "iopub_port": 58724
    }

    Paste the above JSON into a file, and connect with:
        $> ipython <app> --existing <file>
    or, if you are local, you can connect with just:
        $> ipython <app> --existing kernel-43204.json
    or even just:
        $> ipython <app> --existing
        if this is the most recent IPython session you have started.

s

    - As the command told you start the ipython notebook accordingly:
```sh
$ ipython notebook --existing kernel-43204.json
```
  
