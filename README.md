Browser-based MSI data viewer implemented in Rust and WebAssembly. Supports local visualization and analysis of imzML datasets entirely in the browser—no server-side processing or data upload required.

https://kkrijnen.github.io/web-msi-viewer/

At this moment, only .imzML files with the following metadata flags are supported:

    <accession="IMS:1000031" name="processed"/>

    <accession="MS:1000128" name="profile spectrum"/>
