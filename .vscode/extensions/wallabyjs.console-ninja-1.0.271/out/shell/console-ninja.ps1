#!/usr/bin/env pwsh
$env:NODE_OPTIONS='--no-warnings --require "<REPLACE>"'
if ($args) { Invoke-Expression "$args" }

