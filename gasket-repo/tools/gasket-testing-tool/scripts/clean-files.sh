# Keep node_modules to regenerate files
cd __apps__

# loop over folders
for d in */ ; do
    echo "Cleaning $d"
    cd $d
    # loop over files
    for f in * ; do
        # remove everything but node_modules
        if [ $f != "node_modules" ]; then
            echo "Removing $f"
            rm -rf $f
        fi
    done
    cd ..
done

exit;
