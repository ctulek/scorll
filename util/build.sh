if [ $# -eq 0 ]
then
echo "You must supply at least 1 argument used to define release name"
exit 1
fi
backTo=`pwd`
dirName=`dirname $0`
buildScriptPath="$dirName/../public/util/buildscripts"
buildProfile="../../scorll.profile.js"
buildCommand="sh build.sh profileFile=$buildProfile action=release releaseName=$1 cssOptimize=comments"
echo "Change directory to $buildScriptPath"
cd $buildScriptPath
pwd
echo "Running build command..."
echo $buildCommand
$buildCommand
echo "Build command finished"
cd $backTo
