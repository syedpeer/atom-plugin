'use babel';

import * as path from 'path';
import PolymerIde from '../lib/polymer-ide';
import { Severity } from 'polymer-analyzer/lib/model/model';

describe('Linter', () => {
  let provider;
  let editor;
  let projectPath = path.resolve(__dirname, 'fixtures');
  let filePath = path.resolve(projectPath, 'simple.html');

  beforeEach(() => {
    atom.project.setPaths([projectPath]);

    waitsForPromise(() =>
      atom.workspace.open(filePath)
        .then(_editor => {
          editor = _editor;
          return atom.packages.activatePackage('polymer-ide');
        })
        .then(() => {
          provider = PolymerIde.provideLinter();
        }));
  });

  describe('lint', () => {
    it('should return a configuration error if any set', () => {
      provider.configurationError = 'i am an error';

      waitsForPromise(() =>
        provider.lint(editor).then(warnings => {
          expect(warnings.length).toBe(1);

          expect(warnings[0]).toEqual({
            type: 'Error',
            text: 'i am an error',
            range: [[0, 0], [0, 1]],
            filePath: filePath,
            severity: 'error'
          });
        }));
    });

    it('should log an exception if any uncaught', () => {
      spyOn(console, 'error');
      spyOn(provider.editorService, 'getWarningsForFile')
        .andThrow({
          message: 'foo'
        });

      waitsForPromise(() =>
        provider.lint(editor).then(warnings => {
          expect(warnings.length).toBe(0);
          expect(console.error).toHaveBeenCalledWith('foo');
        }));
    });

    it('should return warnings if any', () => {
      const badPath = path.join(projectPath, 'does-not-exist.html');

      waitsForPromise(() =>
        provider.lint(editor).then(warnings => {
          expect(warnings.length).toBe(1);
          expect(warnings[0]).toEqual({
            type: 'Error',
            filePath: filePath,
            range: [[2, 26], [2, 49]],
            text: `Unable to load import: ENOENT: no such file or` +
              ` directory, open '${badPath}'`
          });
        }));
    });
  });
});
