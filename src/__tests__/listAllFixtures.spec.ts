import * as path from 'path';
import listAllFixtures, { listDirectoryFixtures } from '../listAllFixtures';

it('listDirectoryFixtures returns list of all files in directory', () => {  
  expect(listDirectoryFixtures(path.join(__dirname, 'listFiles')))
    .toEqual({
      'bar/fooBar.json': path.join(__dirname, 'listFiles/bar/fooBar.json'),
      'foo/bar.js': path.join(__dirname, 'listFiles/foo/bar.js')
    });
});

it('listDirectoryFixtures returns list of all files for second test dir', () => {  
  expect(listDirectoryFixtures(path.join(__dirname, 'listFilesB')))
    .toEqual({
      'foo.json': path.join(__dirname, 'listFilesB/foo.json'),
      'bar/fooBar.json': path.join(__dirname, 'listFilesB/bar/fooBar.json')
    });
});

it('listAllFixtures should return all fixtures', () => {

  expect(listAllFixtures([path.join(__dirname, 'listFiles'), path.join(__dirname, 'listFilesB')]))
    .toEqual({
      'foo.json': path.join(__dirname, 'listFilesB/foo.json'),
      'foo/bar.js': path.join(__dirname, 'listFiles/foo/bar.js'),
      'bar/fooBar.json': path.join(__dirname, 'listFilesB/bar/fooBar.json'),
    });
});
