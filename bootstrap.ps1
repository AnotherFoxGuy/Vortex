trap [Exception] { 
   write-host "We have an error!"; 
   write-error $("ERROR: " + $_.Exception.Message); 
   sleep 30;
   break; 
}


[System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms")

$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.rootfolder = "MyComputer"

if($dialog.ShowDialog() -ne "OK")
{
  exit
}

cd $dialog.SelectedPath


#
# Check if chocolatey is available
#

if (Get-Command choco -errorAction SilentlyContinue)
{
	Write-Output "Chocolatey found"
}
else
{
	Write-Output "Chocolatey not found, installing it..."
	Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

#
# Install dependencies with chocolatey
#

choco install git yarn python2 vcbuildtools -y

Write-Output "Refreshing Environment"

refreshenv

#
# Clone and build vortex
#

Write-Output "Cloning vortex repo"

Remove-Item vortex -Recurse -Force -ErrorAction SilentlyContinue
git clone https://github.com/Nexus-Mods/Vortex.git vortex

Write-Output "Build vortex"
& yarn config set msvs_version 2015 --global
cd vortex
& yarn install
& yarn run build

