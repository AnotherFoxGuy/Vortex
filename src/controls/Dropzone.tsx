import { DialogActions, DialogType, IDialogContent,
         IDialogResult, showDialog } from '../actions/notifications';
import { ComponentEx, connect, translate } from '../util/ComponentEx';

import Icon from './Icon';

import * as Promise from 'bluebird';

import * as React from 'react';
import * as Redux from 'redux';

export type DropType = 'urls' | 'files';

export interface IBaseProps {
  drop: (type: DropType, paths: string[]) => void;
  accept: DropType[];
  dropText?: string;
  clickText?: string;
  icon?: string;
  clickable?: boolean;
  dialogHint?: string;
  dialogDefault?: string;
  style?: React.CSSProperties;
  dragOverlay?: JSX.Element;
}

interface IConnectedProps {}

interface IActionProps {
  onShowDialog: (type: DialogType, title: string, content: IDialogContent,
                 actions: DialogActions) => Promise<IDialogResult>;
}

type DropMode = 'no' | 'url' | 'file' | 'hover' | 'invalid';

interface IComponentState {
  dropActive: DropMode;
}

type IProps = IBaseProps & IConnectedProps & IActionProps;

class Dropzone extends ComponentEx<IProps, IComponentState> {
  private mWrapperMode: boolean = false;
  private mLeaveDelay: NodeJS.Timer;
  constructor(props) {
    super(props);

    this.initState({
      dropActive: 'no',
    });
  }

  public componentWillMount() {
    // styling is considerably different depending on whether this is
    // a stand-alone control or a wrapper for other controls
    this.mWrapperMode = React.Children.count(this.props.children) > 0;
  }

  public render(): JSX.Element {
    const { t, clickable, dragOverlay, style } = this.props;

    const classes = [ 'dropzone' ];
    if (!this.mWrapperMode) {
      classes.push('stand-alone');
    } else {
      classes.push('wrapper');
    }

    if (this.state.dropActive === 'hover') {
      classes.push('hover-click');
    } else if (['no', 'invalid'].indexOf(this.state.dropActive) === -1) {
      classes.push('hover-valid');
    }

    return (
      <div
        className={classes.join(' ')}
        onDragEnter={this.onDragEnter}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onMouseOver={(clickable !== false) ? this.onHover : undefined}
        onMouseLeave={(clickable !== false) ? this.onHoverLeave : undefined}
        onClick={(clickable !== false) ? this.onClick : undefined}
        style={{ ...style, position: 'relative' }}
      >
        {React.Children.count(this.props.children) > 0
          ? this.props.children
          : this.renderContent()}
        {(dragOverlay !== undefined) && (['no', 'invalid'].indexOf(this.state.dropActive) === -1)
          ? <div className='drag-overlay'>{dragOverlay}</div>
          : null}
      </div>
    );
  }

  private renderContent(): JSX.Element {
    const { t, accept, clickText, dropText, icon } = this.props;
    const { dropActive } = this.state;

    const acceptList = accept.map(mode => {
      return {
        urls: t('URL(s)'),
        files: t('File(s)'),
      }[mode];
    });

    const clickMode = accept[0] === 'urls'
      ? t('enter URL')
      : t('browse for file');

    return (
      <div className='dropzone-content'>
        {(icon !== undefined) ? <Icon name={icon} /> : null}
        {dropActive === 'hover'
          ? t(clickText || 'Click to {{ clickMode }}', { replace: { clickMode } })
          : t(dropText || 'Drop {{ accept }}',
              { replace: { accept: acceptList.join(t(' or ')) } }) }
      </div>
    );
  }

  private setDropMode(evt: React.DragEvent<any>) {
    let type: DropMode = 'invalid';
    if ((evt.dataTransfer.types.indexOf('text/uri-list') !== -1)
        && (this.props.accept.indexOf('urls') !== -1)) {
      type = 'url';
    } else if ((evt.dataTransfer.types.indexOf('Files') !== -1)
               && (this.props.accept.indexOf('files') !== -1)) {
      type = 'file';
    }

    this.nextState.dropActive = type;
    return type !== 'invalid';
  }

  private onDragEnter = (evt: React.DragEvent<any>) => {
    if (evt.preventDefault()) {
      this.setDropMode(evt);
    }
  }

  private onDragOver = (evt: React.DragEvent<any>) => {
    if (this.state.dropActive === 'invalid') {
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    if (this.mLeaveDelay !== undefined) {
      clearTimeout(this.mLeaveDelay);
    }

    if (this.state.dropActive === 'no') {
      this.setDropMode(evt);
    }

    try {
      evt.dataTransfer.dropEffect = this.state.dropActive === 'url'
          ? 'link'
          : 'copy';
    } catch (err) {
      // continue regardless of error
    }
    return false;
  }

  private onDragLeave = (evt: React.DragEvent<any>) => {
    if (['no', 'invalid'].indexOf(this.state.dropActive) !== -1) {
      return;
    }

    evt.preventDefault();
    if (this.mLeaveDelay !== undefined) {
      clearTimeout(this.mLeaveDelay);
    }
    // delay event on drag leave,
    this.mLeaveDelay = setTimeout(() => {
      this.nextState.dropActive = 'no';
    }, 100);
  }

  private onDrop = (evt: React.DragEvent<any>) => {
    const { accept, drop } = this.props;
    evt.preventDefault();

    const url = evt.dataTransfer.getData('Url');
    if ((url !== '') && (accept.indexOf('urls') !== -1)) {
      drop('urls', [url]);
    }

    if ((evt.dataTransfer.files.length > 0) && (accept.indexOf('files') !== -1)) {
      const fileList: string[] = [];
      for (let i = 0; i < evt.dataTransfer.files.length; ++i) {
        fileList.push((evt.dataTransfer.files.item(i) as any).path);
      }
      drop('files', fileList);
    }

    this.nextState.dropActive = 'no';
  }

  private onHover = (evt) => {
    this.nextState.dropActive = 'hover';
  }

  private onHoverLeave = (evt) => {
    this.nextState.dropActive = 'no';
  }

  private onClick = () => {
    const { t, accept, dialogDefault, dialogHint } = this.props;

    const clickMode = accept[0];

    if (clickMode === 'urls') {
      this.props.onShowDialog('info', dialogHint, {
        input: [{
          id: 'url',
          type: 'url',
          value: dialogDefault,
        }],
      }, [ { label: 'Cancel' }, { label: 'Download' } ])
      .then(result => {
          if (result.action === 'Download') {
            this.props.drop('urls', [result.input.url]);
          }
        });
    } else {
      this.context.api.selectFile({
        defaultPath: dialogDefault,
        title: dialogHint,
      }).then(filePath => {
        if (filePath !== undefined) {
          this.props.drop('files', [filePath]);
        }
      });
    }
  }
}

function mapStateToProps(state): IConnectedProps {
  return {
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>): IActionProps {
  return {
    onShowDialog: (type: DialogType, title: string,
                   content: IDialogContent, actions: DialogActions) =>
      dispatch(showDialog(type, title, content, actions)),
  };
}

export default
  translate(['common'], { wait: false })(
    connect(mapStateToProps, mapDispatchToProps)(
      Dropzone)) as React.ComponentClass<IBaseProps>;
