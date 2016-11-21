'use babel';
import { CompositeDisposable } from 'atom';
import { RemoteEditorService } from 'polymer-editor-service/lib/remote-editor-service';
import Autocompleter from './auto-completer';
import Linter from './linter';
import TooltipManager from './tooltip-manager';
class PolymerIde {
    constructor() {
        this.subscriptions = null;
        this.linter = null;
        this.autocompleter = null;
    }
    activate(_) {
        // Initialize.
        this.linter = new Linter();
        this.autocompleter = new Autocompleter();
        // Events subscribed to in atom's system can be easily cleaned up with a
        // CompositeDisposable
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.project.onDidChangePaths((projectPaths) => {
            this.setProjectPaths(projectPaths);
        }));
        this.setProjectPaths(atom.project.getPaths());
        this.subscriptions.add(new TooltipManager(this.editorService));
    }
    ;
    deactivate() {
        this.subscriptions.dispose();
        this.subscriptions = null;
        this.editorService = null;
        this.linter = null;
        this.autocompleter = null;
    }
    ;
    setProjectPaths(projectPaths) {
        if (projectPaths.length === 0) {
            this.linter.configurationError = 'polymer-ide only works with projects.';
        }
        else if (projectPaths.length > 1) {
            this.linter.configurationError =
                `polymer-ide only works with projects with exactly one root ` +
                    `directory, this project has: ${JSON.stringify(projectPaths)}`;
        }
        else {
            const rootDir = projectPaths[0];
            if (this.editorService) {
                this.editorService.dispose();
            }
            this.editorService = new RemoteEditorService(rootDir);
            this.subscriptions.add(this.editorService);
            this.linter.configurationError = null;
            this.linter.editorService = this.editorService;
            this.autocompleter.editorService = this.editorService;
        }
    }
    ;
    serialize() {
        return {};
    }
    ;
    provideLinter() {
        return this.linter;
    }
    ;
    provideAutocompleter() {
        return this.autocompleter;
    }
    ;
}
;
export default new PolymerIde();
//# sourceMappingURL=polymer-ide.js.map