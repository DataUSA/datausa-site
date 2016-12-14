# Download census-y TIGER data
# Tip of the hat to CensusReporter: https://github.com/censusreporter/census-postgres-scripts/blob/master/12_download_tiger_2015.sh

downloadShapefiles () {

  export SHAPEFILEPATH="./$1/shapefiles"

  mkdir $SHAPEFILEPATH
  rm -r $SHAPEFILEPATH/*
  wget --show-progress --recursive --continue --accept=*.zip \
       --no-parent --cut-dirs=4 --no-host-directories \
       --directory-prefix=$SHAPEFILEPATH \
      ftp://ftp2.census.gov/geo/tiger/TIGER2015/$2/
  unzip -d $SHAPEFILEPATH "$SHAPEFILEPATH/*.zip"
  rm $SHAPEFILEPATH/*.zip

}

# downloadShapefiles pumas PUMA # these ones aren't clipped to the ocean!
downloadShapefiles places PLACE
downloadShapefiles counties COUNTY
downloadShapefiles msas CBSA
downloadShapefiles states STATE
downloadShapefiles tracts TRACT
