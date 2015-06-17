---
layout: post
title: Zotero the missing citation manager
author: Ondrej Platek
tags: pdf, citation, manager
---

The fun fact about [Zotero](https://www.zotero.org/) is that I have never wanted to use it until I see it in action.
In fact, I did not want to use any citation manager.

What is a citation manager? A pretty boring piece of software:

- You can browse all your pdf papers from one window. _Well, file manager or [Calibre](www.calibre.com) can do it too, right?_
- You can track affiliations and ``BibTex`` entries for each article. _Oh yes! I hate doing that!_
- You can full text search through pdfs. _Argh... simple with pdf2txt and grep, right?_
- Synchronize it across devices.

That was my first reaction. The second one was _wait, what?!_ [Zotero](https://www.zotero.org/) can do it all out of the box?

Let me tell you how do I use it now:

* The new release of ``Zotero 4.0`` introduced option to store the database and pdfs to particular path which can be synchronized via ``Google Drive``, ``Dropbox``, etc. Nice start I have backups!
* I installed the ``Zotero Standalone`` and ``Google Chrome`` plugin, which allows you to store the affiliation, pdf names, in fact the whole ``BibTex`` entry directly from http://scholar.google.com, http://research.microsoft.com, and other websites
* The cool thing that you can add almost any other *raw pdf* and download the meta information, the ``BibTex`` entry directly from ``Zotero``
    - I just download the pdf
    - Drop it from file manager to ``Zotero``
    - Open the menu for the pdf and click ``Retrieve Metadata for PDF``. See the picture below.
    - Wait few seconds before Zotero do finishes its magic, and full BibTex entry is downloaded.
    This works for almost every paper. Even for **mine** ... which totally got me!

![Zotero is retrieving the metadata.]({{ site.baseurl }}/public/2015-05-17-zotero_retrieving.png "Zotero is retrieving the metadata.")
![Zotero downloaded metadata for my article.]({{ site.baseurl }}/public/2015-05-17-zotero_done.png "Zotero finished downloading metadata for my article.")
